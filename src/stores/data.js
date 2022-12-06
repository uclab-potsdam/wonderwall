// // import { ref, computed } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { WOQLClient, WOQL } from "@terminusdb/terminusdb-client";

// eslint-disable-next-line vue/prefer-import-from-vue
import { isObject, isArray } from "@vue/shared";
import { ref, computed, watch } from "vue";

import { useSyncStore } from "@/stores/sync";

export const useDataStore = defineStore("data", () => {
  const syncStore = useSyncStore();
  const client = ref(null);
  const ranges = ref([]);
  // const activeRanges = ref([]);
  const activeIds = ref([]);
  const entities = ref([]);
  // const requestedEntities = ref([]);
  const branches = ref([]);
  const degrees = ref(1);

  // detach updates from syncStore.time updates
  watch(
    () => syncStore.time,
    (time) => {
      const current = ranges.value
        .filter((range) => time >= range.in && time <= range.out)
        .map((r) => r.id);

      const toRemove = activeIds.value.filter((id) => !current.includes(id));
      const toAdd = current.filter((id) => !activeIds.value.includes(id));

      toRemove.forEach((id) => {
        const index = activeIds.value.indexOf(id);
        if (index != -1) activeIds.value.splice(index, 1);
      });
      activeIds.value.push(...toAdd);
    }
  );

  const activeRanges = computed(() =>
    ranges.value.filter(
      (range) => syncStore.time >= range.in && syncStore.time <= range.out
    )
  );

  const activeEntities = computed(() =>
    activeRanges.value
      .map((r) => entities.value.find((e) => e["@id"] === r.id))
      .filter((d) => d != null)
  );

  async function connect() {
    const server = import.meta.env.VITE_SERVER;
    client.value = new WOQLClient(server, {
      user: import.meta.env.VITE_USER,
      token: import.meta.env.VITE_TOKEN,
      organization: import.meta.env.VITE_ORGANIZATION,
    });
    client.value.db(import.meta.env.VITE_DB);
    // try {
    //   const schema = await client.value.getSchema();
    //   console.log(schema);
    // } catch (error) {
    //   console.error(error);
    // }

    branches.value = Object.entries(await client.value.getBranches()).map(
      (d) => d[1]
    );
    const schema = await client.value.query(
      WOQL.or(
        ...branches.value.map(
          (branch) =>
            WOQL.using(`branch/${branch.name}`)
              .select("v:ref", "v:name", "v:description", "v:type")
              .member("v:ref", [`branch/${branch.name}`])
              .triple("v:id", "rdf:type", "@schema:Graph")
          // .quad("terminusdb://context", "sys:metadata", "v:json", "schema")
          // .quad("v:json", "json:_name", "v:name", "schema")
          // .quad("v:json", "json:_description", "v:description", "schema")
          // .quad("v:json", "json:_type", "v:type", "schema")
        )
      )
    );

    console.log(unpack(schema.bindings));
    // console.log(
    //   await client.value.getDocument({
    //     as_list: true,
    //     id: "@base:@bla",
    //   })
    // );

    ranges.value = await fetch("/ranges.json").then((d) => d.json());
  }

  watch(
    activeIds,
    () => {
      console.log("call");
      requestEntities(activeIds.value, degrees.value);
    },
    { deep: true }
  );

  async function requestEntities(ids, deg) {
    const newIds = ids.filter(
      (id) => !entities.value.map((d) => d.id).includes(id)
    );
    console.log(ids, newIds);

    let newEntities = [];
    const existingEntities = ids
      .map((id) => entities.value.find((d) => d.id === id))
      .filter((d) => d != null);

    if (newIds.length > 0) {
      const response = await client.value.query(
        WOQL.select("id", "props")
          .group_by("v:id", ["ref", "sub", "pre", "obj", "label"], "v:props")
          .or(
            ...newIds.map((id) =>
              WOQL.member("v:id", [id]).or(
                ...branches.value.map((branch) =>
                  WOQL.using(`branch/${branch.name}`)
                    // .select("v:ref", "v:entity", "v:subject", "v:prop")
                    .member("v:ref", [`branch/${branch.name}`])
                    // .read_document(id, "v:entity")
                    .or(
                      WOQL.select("v:label")
                        .triple("v:id", "label", "v:label_id")
                        .read_document("v:label_id", "v:label"),
                      WOQL.triple("v:sub", "v:pre", "v:id"),
                      WOQL.triple("v:id", "v:pre", "v:obj")
                    )
                )
              )
            )
          )
      );

      newEntities = unpack(response.bindings).map((bindings) => {
        const props = bindings.props.map((p) => {
          const ref = p[0];
          const sub = p[1];
          const pre = p[2];
          const obj = p[3];
          const label = p[4];
          return {
            ref,
            id: pre?.replace(/^@schema:/, "") || null,
            inverse: sub !== null,
            value: sub || obj,
            label,
          };
        });

        const label = props.find((prop) => prop.id == null)?.label.en;

        const reservedKeys = ["label", "position", "rdf:type"];
        const selectedProps = props.filter(
          (prop) => prop.id != null && !reservedKeys.includes(prop.id)
        );

        return { id: bindings.id, label, props: selectedProps };
      });
    }

    // const newEntities = ids.map((id) => {
    //   const entity = bindings.filter((b) => b.id === id).map((d) => d.entity);
    //   // console.log(entity);
    //   return entity.reduce((a, b) => ({ ...a, ...b }));
    // });

    entities.value.push(...newEntities);
    if (deg > 0) {
      const nextDegree = [...existingEntities, ...newEntities]
        .map((entity) => entity.props.map((prop) => prop.value))
        .flat(2);
      requestEntities(nextDegree, deg - 1);
    }
  }

  return {
    client,
    ranges,
    activeRanges,
    entities,
    activeEntities,
    activeIds,
    degrees,
    connect,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot));
}

function unpack(obj) {
  if (isArray(obj)) {
    return obj.map((o) => unpack(o));
  }
  return Object.fromEntries(
    Object.entries(obj).map((o) => {
      return [
        o[0],
        isObject(o[1]) && o[1]["@value"] !== undefined ? o[1]["@value"] : o[1],
      ];
    })
  );
}

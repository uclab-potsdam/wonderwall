// // import { ref, computed } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { WOQLClient, WOQL } from "@terminusdb/terminusdb-client";

// eslint-disable-next-line vue/prefer-import-from-vue
import { isObject, isArray } from "@vue/shared";
import { ref, computed, watch, watchEffect } from "vue";

import { useSyncStore } from "@/stores/sync";

import uniqWith from "lodash.uniqwith";
import isEqual from "lodash.isequal";

export const useDataStore = defineStore("data", () => {
  const syncStore = useSyncStore();
  const client = ref(null);
  const ranges = ref([]);
  const active = ref("");
  const userIds = ref([]);
  const entities = ref([]);
  const relations = ref([]);
  const branches = ref([]);
  const degrees = ref(2);
  const userActive = ref(null);
  const history = ref([]);
  const preloadBuffer = ref(3);
  const requesting = ref([]);

  // const { time } = storeToRefs(syncStore);

  // const active = computed(() =>
  //   ranges.value.find(
  //     (range) => syncStore.time >= range.in && syncStore.time < range.out
  //   )
  // );

  // decouple *syncStore.time* and *active*
  // to prevent pemanent recomputing of computed values referring to *active*
  watchEffect(() => {
    // todo: check why + 0.001 is needed when jumping using timestamps in thecontrols
    const index = ranges.value.findLastIndex((range) => syncStore.time + 0.001 >= range.in);
    const id = ranges.value[index]?.id;
    if (id !== active.value) {
      active.value = id;
      const preload = ranges.value.slice(index, index + preloadBuffer.value).map((range) => range.id);
      requestEntitiesAndRelations(preload, degrees.value);
      // console.log("preload", nextPreload);
      //  = nextPreload;
    }

    // console.log(time);
    extendHistory();
  });
  // watch(time, (newTime, oldTime) => {
  //   // console.log(newTime, time);
  //   const a = ranges.value.find((range) => newTime >= range.in && newTime < range.out)?.id;
  //   if (a !== active.value) active.value = a;
  //   // console.log(oldSync.time, sync.time);
  //   if (oldTime < newTime) extendHistory();
  // });

  const activeEntityTimestamps = computed(() => {
    return ranges.value.filter((r) => r.id === activeEntity.value?.id).map((d) => d.in);
  });

  const currentEntityTimestamps = computed(() => {
    return [
      ...new Set(
        relations.value
          .filter((r) => r.subject === activeEntity.value?.id || r.object === activeEntity.value?.id)
          .map((r) => [r.subject, r.object])
          .flat()
      ),
    ]
      .map((id) =>
        ranges.value
          .map((r, index) => ({ ...r, index }))
          .filter((r) => r.id === id)
          .map((d) => ({
            in: d.in,
            out: ranges.value[d.index + 1]?.in || d.in + 60, // todo: handle last timestamp
            active: d.id === activeEntity.value?.id,
            label: entities.value.find((entity) => entity.id === d.id)?.label?.en,
          }))
      )
      .flat()
      .sort((r) => (r.active ? 1 : -1));
  });

  const activeEntity = computed(() => entities.value.find((e) => e.id === (userActive.value || active.value)));

  const historyPath = computed(() =>
    history.value.filter((id, i) => i < history.value.length - 2).map((id, i) => [id.id, history.value[i + 1].id])
  );

  // const hierarchy = computed(() => {
  //   const entity = entities.value.find((e) => e.id === active.value.id);
  //   return {
  //     entity,
  //     out: entity.props.map(({ id, label, value }) => ({
  //       id,
  //       label: label || id.replace(/_/g, " "),
  //       entity: entities.value.find((e) => e.id === value),
  //     })),
  //     in: entities.value.filter(e => e.props.find(p => p.value === ))
  //   };
  // });

  watch(active, () => {
    if (active.value == null) return;
    requestEntitiesAndRelations([active.value], degrees.value);
  });

  // watch(history, (history) => {
  //   console.log('history change')
  //   if (history.length < 5) return;

  //   // requestEntitiesAndRelations([active.value], degrees.value);
  // });

  function extendHistory() {
    const id = userActive.value || active.value;
    if (history.value[0] !== id) {
      history.value.unshift(id);
      if (history.value.length > 2) {
        history.value = history.value.slice(0, 2);
      }
    }
  }

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

    const hideBranches = ["canvas-pottery-copy"];
    const branchesProxy = {
      main: {
        "@id": "Branch/main",
        "@type": "Branch",
        name: "main",
        head: "InitialCommit/jag6ibll1zds9unz7zhty4fuo5djsb0",
      },
      "template-production": {
        "@id": "Branch/template-production",
        "@type": "Branch",
        name: "template-production",
        head: "ValidCommit/lq5xp3mxjsji1mfb6rg9xdaalxoqchs",
      },
      "dictionary-main": {
        "@id": "Branch/dictionary-main",
        "@type": "Branch",
        name: "dictionary-main",
        head: "ValidCommit/wfewf6vuaj9l8omdzvbviikrs99ae6d",
      },
      "canvas-pottery": {
        "@id": "Branch/canvas-pottery",
        "@type": "Branch",
        name: "canvas-pottery",
        head: "ValidCommit/e7yjstxc1p8o91exg8jw4f7kbk7jsfs",
      },
      Shortcut: {
        "@id": "Branch/Shortcut",
        "@type": "Branch",
        name: "Shortcut",
        head: "ValidCommit/ktp3kfom7b972g8scmv8ig4941qzh5s",
      },
      "canvas-pottery-copy": {
        "@id": "Branch/canvas-pottery-copy",
        "@type": "Branch",
        name: "canvas-pottery-copy",
        head: "ValidCommit/cb6mycatap7a6amjlga7654vr1ylzh6",
      },
      test: {
        "@id": "Branch/test",
        "@type": "Branch",
        name: "test",
        head: "ValidCommit/v0j73wybp0i0xj3grd5pkqftbtbou3q",
      },
    };
    branches.value = Object.entries(branchesProxy)
      // branches.value = Object.entries(await client.value.getBranches())
      .map((d) => d[1])
      .filter((b) => !hideBranches.includes(b.name));
    // const schema = await client.value.query(
    //   WOQL.or(
    //     ...branches.value.map(
    //       (branch) =>
    //         WOQL.using(`branch/${branch.name}`)
    //           .select("v:ref", "v:name", "v:description", "v:type")
    //           .member("v:ref", [`branch/${branch.name}`])
    //           .triple("v:id", "rdf:type", "@schema:Graph")
    //       // .quad("terminusdb://context", "sys:metadata", "v:json", "schema")
    //       // .quad("v:json", "json:_name", "v:name", "schema")
    //       // .quad("v:json", "json:_description", "v:description", "schema")
    //       // .quad("v:json", "json:_type", "v:type", "schema")
    //     )
    //   )
    // );

    ranges.value = await fetch("/ranges.json")
      .then((d) => d.json())
      .then((ranges) =>
        ranges.map((range, index, ranges) => {
          const duration = 2;
          if (range.in != null) return range;
          const next = ranges.findIndex((r, i) => i > index && r.in != null);
          const previous = ranges.findLast((r, i) => i < index && r.in != null);
          const inTime = ranges[next].in - duration * (next - index);
          if (inTime - duration <= previous.in) {
            console.log("RANGE CONFLICT", inTime - previous.in, range);
            console.log(
              "previous",
              new Date(previous.in * 1000)
                .toISOString()
                .replace(/[^:]+:/, "")
                .replace(/Z/, ""),
              previous
            );
            console.log(
              "next",
              new Date(ranges[next].in * 1000)
                .toISOString()
                .replace(/[^:]+:/, "")
                .replace(/Z/, ""),
              ranges[next]
            );
            console.log("\n\n");
          }
          return {
            ...range,
            in: inTime,
          };
        })
      );
  }

  async function requestEntitiesAndRelations(ids, deg) {
    const newIds = ids.filter((id) => ![...entities.value.map((d) => d.id), ...requesting.value].includes(id));
    requesting.value = [...requesting.value, ...newIds];
    const response =
      newIds.length === 0
        ? { bindings: [] }
        : await client.value.query(
            WOQL.select("id", "props")
              .group_by("v:id", ["ref", "sub", "pre", "obj", "label"], "v:props")
              .or(
                ...newIds.map((id) =>
                  WOQL.member("v:id", [id]).or(
                    ...branches.value.map((branch) =>
                      WOQL.using(`branch/${branch.name}`)
                        .member("v:ref", [`branch/${branch.name}`])
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

    // console.log(response);
    requesting.value = requesting.value.filter((id) => !newIds.includes(id));
    const unpacked = unpack(response.bindings);
    const newEntities = unpacked.map((bindings) => {
      const label = bindings.props.find((p) => p[4] != null);
      const entityType = bindings.props.find((p) => p[2] === "rdf:type");
      // if (label == null) return null;
      return {
        id: bindings.id,
        label: label[4],
        type: entityType[3].replace(/@schema:/, ""),
      };
    });

    entities.value.push(...newEntities);

    const newRelations = unpacked
      .map((bindings) => {
        // const reservedKeys = ["label", "position", "rdf:type"];
        const reservedKeys = ["@schema:label", "@schema:position", "rdf:type"];
        return bindings.props
          .filter((p) => p[2] != null && !reservedKeys.includes(p[2]))
          .map((p) => {
            return {
              subject: p[1] || bindings.id,
              predicate: p[2].replace(/@schema:/, ""),
              object: p[3] || bindings.id,
              branch: p[0],
            };
          });
      })
      .flat()
      .filter(
        (r1) =>
          relations.value.find(
            (r2) =>
              r1.subject === r2.subject &&
              r1.predicate === r2.predicate &&
              r1.object === r2.object &&
              r1.branch === r2.branch
          ) == null
      );

    // relations.value.push(...newRelations)
    relations.value = uniqWith([...relations.value, ...newRelations], isEqual);
    // uniqBy([...relations, ...newRelations], (node) => node.entity.id),

    if (deg > 0) {
      const nextDegree = [
        ...new Set(
          ids
            .map((id) =>
              relations.value.filter((r) => r.subject === id || r.object === id).map((r) => [r.subject, r.object])
            )
            .flat(2)
        ),
      ];

      requestEntitiesAndRelations(nextDegree, deg - 1);
      // const existingEntities = ids
      // .map((id) => entities.value.find((d) => d.id === id))
      // .filter((d) => d != null);
      //   const nextDegree = [...existingEntities, ...newEntities]
      //     .map((entity) => entity.props.map((prop) => prop.value))
      //     .flat(2);
      //   console.log(nextDegree);
      //   requestEntitiesAndRelations(nextDegree, deg - 1);
    }
  }

  let userInteractedTimeout = null;
  function select(id) {
    clearTimeout(userInteractedTimeout);
    userActive.value = id;
    extendHistory();
    requestEntitiesAndRelations([userActive.value], degrees.value);
    userInteractedTimeout = setTimeout(() => {
      userActive.value = null;
      extendHistory();
    }, 5000);
    // userIds.value.push(node.id);
    // setTimeout(() => {
    //   const index = userIds.value.indexOf(node.id);
    //   if (index != -1) userIds.value.splice(index, 1);
    // }, 1000 * 15);
  }

  function registerMovement() {
    clearTimeout(userInteractedTimeout);
    userInteractedTimeout = setTimeout(() => {
      userActive.value = null;
      extendHistory();
    }, 5000);
  }

  return {
    branches,
    client,
    ranges,
    active,
    activeEntity,
    entities,
    userIds,
    degrees,
    relations,
    // hierarchy,
    connect,
    select,
    requestEntitiesAndRelations,
    historyPath,
    history,
    registerMovement,
    activeEntityTimestamps,
    currentEntityTimestamps,
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
      return [o[0], isObject(o[1]) && o[1]["@value"] !== undefined ? o[1]["@value"] : o[1]];
    })
  );
}

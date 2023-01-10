// // import { ref, computed } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

import { ref, computed, watch } from "vue";

import { useDataStore } from "@/stores/data";

import * as d3 from "d3-force";

export const useForceStore = defineStore("force", () => {
  const dataStore = useDataStore();

  const nodes = ref([]);
  const links = ref([]);

  const simulation = d3
    .forceSimulation()
    .force("center", d3.forceCenter())
    .force("charge", d3.forceManyBody().strength(-1000))
    // .force(
    //   "bounds",
    //   bounds()
    //     .minX(-window.innerWidth / 2 + 75)
    //     .maxX(window.innerWidth / 2 - 75)
    //     .minY(-window.innerHeight / 2 + 100)
    //     .maxY(window.innerHeight / 2 - 100)
    // )
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .distance(150)
    )
    // .force("x", d3.forceX())
    // .force("y", d3.forceY())
    .on("tick", () => {});

  dataStore.$subscribe((mutation, state) => {
    console.log(state);
    const activeEntities = findEntities(
      [...state.activeIds, ...state.userIds],
      state.entities,
      state.degrees
    );

    const old = new Map(nodes.value.map((d) => [d.id, d]));
    // nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
    nodes.value = activeEntities.map((entity) => {
      return Object.assign(old.get(entity.id) || { x: 500, y: 0 }, {
        id: entity.id,
        label: entity.label,
        active: [...state.activeIds, ...state.userIds].includes(entity.id),
      });
    });

    const activeLinks = activeEntities
      .map((entity) => {
        return entity.props
          .filter((d) => !d.inverse)
          .map((prop) => {
            return {
              source: entity.id,
              target: prop.value,
              label: prop.id,
              id: `${entity.id}/${prop.value}/${prop.id}`,
            };
          })
          .filter((d, i, all) => all.findIndex((d2) => d2.id === d.id) === i);
      })
      .flat(3)
      .filter((link) => nodes.value.map(({ id }) => id).includes(link.target));
    links.value = activeLinks;

    simulation.nodes(nodes.value);
    simulation.force("link").links(links.value);
    // simulation.alpha(1).restart();
    simulation.alpha(1).tick(500).stop();
  });

  return { nodes, links };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useForceStore, import.meta.hot));
}

function findEntities(ids, entities, deg, matchedIds = []) {
  const matchedEntities = ids
    .map((id) => entities.find((entity) => entity.id === id))
    .filter((entity) => entity != null);

  if (deg > 0) {
    matchedIds.push(...ids);
    const nextDegree = [
      ...new Set(
        matchedEntities
          .map((entity) => entity.props.map((prop) => prop.value))
          .flat(2)
          .filter((id) => !matchedIds.includes(id))
      ),
    ];
    matchedEntities.push(
      ...findEntities(nextDegree, entities, deg - 1, matchedIds)
    );
  }
  return matchedEntities;
}

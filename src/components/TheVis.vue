<script setup>
import { useDataStore } from "@/stores/data";
import { ref, computed } from "vue";

import VisEdge from "@/components/VisEdge.vue";
import VisNode from "@/components/VisNode.vue";
import BaseInterpolate from "@/components/BaseInterpolate.vue";

// const syncStore = useSyncStore();
const dataStore = useDataStore();

const height = ref(innerHeight);
const width = ref(innerWidth);

const margin = [100, 200, 100, 200];
const degRange = 120;
const degOffsetRight = (180 - degRange) / 2 - 90;
const degOffsetLeft = degOffsetRight + 180;

window.onresize = () => {
  height.value = innerHeight;
  width.value = innerWidth;
};

dataStore.connect();

const getRelatedEntities = (id, dir = "LEFT") => {
  return dataStore.relations
    .filter((r) => r[dir === "LEFT" ? "object" : "subject"] === dataStore.activeEntity?.id)
    .map((relation, i, relations) => {
      const count = relations.length;
      const fraction = count === 1 ? 0.5 : (1 / (count - 1)) * i;
      const deg = fraction * degRange + (dir === "LEFT" ? degOffsetLeft : degOffsetRight);
      const r = (height.value - margin[0] - margin[2]) / 2;

      // const deg =

      const x = r * Math.cos((Math.PI * 2 * deg) / 360);
      const y = r * Math.sin((Math.PI * 2 * deg) / 360);
      return {
        entity: dataStore.entities.find((e) => e.id === relation[dir === "LEFT" ? "subject" : "object"]),
        relation,
        position: { x, y },
      };
    })
    .filter((r) => r.entity != null);
};

const layout = computed(() => {
  if (dataStore.activeEntity == null) return [];
  const left = getRelatedEntities(dataStore.activeEntity?.id, "LEFT");
  const right = getRelatedEntities(dataStore.activeEntity?.id, "RIGHT");

  const center = { entity: dataStore.activeEntity, position: { x: 0, y: 0 } };

  const edges = [
    ...left.map((node) => ({
      source: { ...node.position, id: node.entity.id },
      target: { ...center.position, id: center.entity.id },
      label: node.relation.predicate,
    })),
    ...right.map((node) => ({
      source: { ...center.position, id: center.entity.id },
      target: { ...node.position, id: node.entity.id },
      label: node.relation.predicate,
    })),
  ];

  return {
    nodes: [...left, ...right, center],
    edges,
  };
});
</script>

<template>
  <svg>
    <g :transform="`translate(${width / 2} ${height / 2})`">
      <g class="edges" v-if="dataStore.activeEntity">
        <!-- <g class="edges" v-if="dataStore.activeEntity">
          <BaseInterpolate
            v-for="edge in layout.edges"
            :key="`${edge.source.id}--${edge.label}--${edge.target.id}`"
            :props="{ edge }"
            v-slot="interpolated"
          >
            <VisEdge v-bind="interpolated.edge" />
          </BaseInterpolate>
        </g> -->
        <TransitionGroup name="default">
          <VisEdge
            v-for="edge in layout.edges"
            :key="`${edge.source.id}--${edge.label}--${edge.target.id}`"
            v-bind="edge"
          />
        </TransitionGroup>
      </g>
      <!-- <g class="nodes" v-if="dataStore.activeEntity">
        <BaseInterpolate
          v-for="node in layout.nodes"
          :key="node.entity.id"
          :props="{ position: node.position }"
          v-slot="interpolated"
        >
          <VisNode :entity="node.entity" v-bind="interpolated" />
        </BaseInterpolate>
      </g> -->

      <g class="nodes" v-if="dataStore.activeEntity">
        <TransitionGroup name="default">
          <VisNode v-for="node in layout.nodes" :key="node.entity.id" :entity="node.entity" :position="node.position" />
        </TransitionGroup>
      </g>
    </g>
  </svg>
</template>

<style scoped lang="scss">
svg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgb(var(--blue-gray-10));

  .links {
    .link {
      .label {
        text-anchor: middle;
        font-size: var(--font-size);
        fill: rgb(var(--blue-gray-2));
        text-transform: uppercase;
      }

      path {
        stroke: rgb(var(--blue-gray-8));
      }
    }
  }

  .nodes {
    .node {
      foreignObject {
        overflow: visible;
      }
      .label {
        position: fixed;
        // color: rgba(var(--gray-4));
        transform: translate(-50%, -50%);
        font-size: var(--font-size-l);
        // text-align: center;

        // opacity: 0;
        transition: opacity 0.5s;
        filter: blur(0.5px);
        mark {
          transition: font-weight 0.5s, color 0.5s;
          background-color: rgba(var(--blue-gray-10), 0.5);
          // outline: var(--spacing-xs) solid rgb(var(--blue-gray-10));
          // box-shadow: 5px 0 red;
          color: rgb(var(--blue-gray-8));
        }

        &.active {
          opacity: 1;
          filter: blur(0px);

          mark {
            font-weight: 600;
            color: rgb(var(--gray-0));
            font-size: var(--font-size-l);
            // background-color: rgb(var(--yellow-7));
            // outline: var(--spacing-xs) solid rgb(var(--yellow-7));
          }
        }
      }
    }
  }

  .default-enter-active {
    transition: all 0.5s 1s ease;
  }
  .default-leave-active {
    transition: all 0.5s ease;
  }
  .default-enter-from,
  .default-leave-to {
    opacity: 0;
    filter: blur(15px);
  }
}
</style>

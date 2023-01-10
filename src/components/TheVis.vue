<script setup>
import { useDataStore } from "@/stores/data";
import { useForceStore } from "@/stores/force";
import { ref, computed } from "vue";

import VisEdge from "@/components/VisEdge.vue";

// const syncStore = useSyncStore();
const dataStore = useDataStore();
const forceStore = useForceStore();

const scale = computed(() => {
  // const min_x = Math.min(...forceStore.nodes.map((d) => d.x));
  const max_x = Math.max(...forceStore.nodes.map((d) => Math.abs(d.x)));
  // const min_y = Math.min(...forceStore.nodes.map((d) => d.y));
  const max_y = Math.max(...forceStore.nodes.map((d) => Math.abs(d.y)));
  const padding = 80;
  const ratio_x = (innerWidth - padding * 2) / (max_x * 2);
  const ratio_y = (innerHeight - padding * 2) / (max_y * 2);

  const ratio = Math.min(ratio_x, ratio_y, 2.5);

  return ratio;
});

const height = ref(innerHeight);
const width = ref(innerWidth);

window.onresize = () => {
  height.value = innerHeight;
  width.value = innerWidth;
};

dataStore.connect();
</script>

<template>
  <svg>
    <g :transform="`translate(${width / 2} ${height / 2}) scale(${scale})`">
      <g class="links">
        <VisEdge
          v-for="link in forceStore.links"
          :key="`${link.source.id}/${link.target.id}`"
          :source="link.source"
          :target="link.target"
          :label="link.label"
        />
      </g>
      <g class="nodes">
        <g
          class="node"
          v-for="node in forceStore.nodes"
          :key="node.id"
          :transform="`translate(${node.x} ${node.y})`"
        >
          <!-- <circle r="10" :fill="node.active ? 'red' : 'grey'" />
          <text>{{ node.label }}</text> -->
          <foreignObject width="1" height="1">
            <div
              class="label"
              :class="{ active: node.active }"
              @click="dataStore.select(node)"
            >
              <mark>{{ node.label }}</mark>
            </div>
          </foreignObject>
        </g>
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
}
</style>

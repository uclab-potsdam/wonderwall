<script setup>
import { useSyncStore } from "@/stores/sync";
import { useDataStore } from "@/stores/data";
import { useForceStore } from "@/stores/force";
import { ref } from "vue";

// const syncStore = useSyncStore();
const dataStore = useDataStore();
const forceStore = useForceStore();

const height = ref(innerHeight);
const width = ref(innerWidth);

window.onresize = (event) => {
  height.value = innerHeight;
  width.value = innerWidth;
};

console.log(forceStore);

dataStore.connect();
</script>

<template>
  <!-- <div>{{ syncStore.time }}</div>
  <div>{{ forceStore.nodes }}</div>
  <div class="entities">
    <div class="entity" v-for="range in dataStore.activeRanges" :key="range.id">
      {{ range.label }}
    </div>
  </div>
  <div class="entities">
    <div
      class="entity"
      v-for="range in dataStore.activeEntities"
      :key="range.id"
    >
      {{ range.label.en }}
    </div>
  </div> -->
  <svg>
    <g :transform="`translate(${width / 2} ${height / 2})`">
      <g class="links">
        <g
          class="link"
          v-for="(link, i) in forceStore.links"
          :key="`${link.source.id}/${link.target.id}`"
        >
          <path
            stroke="white"
            stroke-width="10"
            :d="`M${link.source.x},${link.source.y}L${link.target.x},${link.target.y}`"
            yid="`path-${link.source.id}-${link.target.id}`"
            :id="`path-${i}`"
          />
          <text class="label">
            <textPath
              yhref="`#path-${link.source.id}-${link.target.id}`"
              :href="`#path-${i}`"
              :startOffset="`50%`"
              dominant-baseline="middle"
            >
              {{ link.label.replaceAll("_", " ") }}
            </textPath>
          </text>
        </g>
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
          <foreignObject width="150" height="1">
            <div class="label" :class="{ active: node.active }">
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
  background: black;

  .links {
    .link {
      .label {
        text-anchor: middle;
        font-size: var(--font-size);
        // fill: var(--edges);
      }
    }
  }

  .nodes {
    .node {
      foreignObject {
        overflow: visible;
      }
      .label {
        position: absolute;
        color: rgb(var(--gray-0));
        transform: translate(-50%, -50%);
        font-size: var(--font-size-l);
        text-align: center;
        mark {
          background-color: rgb(var(--gray-11));
          outline: var(--spacing-xs) solid rgb(var(--gray-11));
          // box-shadow: 5px 0 red;
        }

        &.active {
          mark {
            background-color: rgb(var(--yellow-7));
            outline: var(--spacing-xs) solid rgb(var(--yellow-7));
          }
        }
      }
    }
  }
}
</style>

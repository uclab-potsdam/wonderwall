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
          v-for="link in forceStore.links"
          :key="`${link.source}/${link.target}`"
        >
          <line
            stroke="black"
            :x1="link.source.x"
            :y1="link.source.y"
            :x2="link.target.x"
            :y2="link.target.y"
          />
          <!-- <text>{{ node.label }}</text> -->
        </g>
      </g>
      <g class="nodes">
        <g
          class="node"
          v-for="node in forceStore.nodes"
          :key="node.id"
          :transform="`translate(${node.x} ${node.y})`"
        >
          <circle r="10" :fill="node.active ? 'red' : 'grey'" />
          <text>{{ node.label }}</text>
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
}
.entities {
  display: flex;
  flex-wrap: wrap;
  .entity {
    background: var(--text);
    color: var(--background);
    margin: var(--spacing);
    padding: var(--spacing-s) var(--spacing);
    font-size: var(--font-size-l);
    font-weight: var(--bold);
  }
}
</style>

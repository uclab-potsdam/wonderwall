<script setup>
import { ref, computed } from "vue";
import BaseInterpolate from "@/components/BaseInterpolate.vue";

const props = defineProps(["source", "target", "label"]);

const path = computed(() => {
  const source = { x: props.source.x, y: props.source.y };
  const target = { x: props.target.x, y: props.target.y };

  return `M${source.x},${source.y}L${target.x},${target.y}`;
});
</script>

<template>
  <g class="link">
    <BaseInterpolate :props="{ path }" :delay="500" v-slot="value">
      <path stroke-width="1" :d="value.path" :id="`path-${props.source.id}-${props.target.id}`" />
      <text class="label">
        <textPath :href="`#path-${props.source.id}-${props.target.id}`" :startOffset="`50%`" dominant-baseline="middle">
          {{ props.label.replaceAll("_", " ") }}
        </textPath>
      </text>
    </BaseInterpolate>
  </g>
</template>

<style scoped lang="scss">
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
</style>
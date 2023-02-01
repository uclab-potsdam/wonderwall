<script setup>
import { ref, isRef, computed, watch, watchEffect } from "vue";
import BaseInterpolate from "@/components/BaseInterpolate.vue";
// import interpolate from "@/assets/js/interpolate";

const props = defineProps(["entity", "position", "degree"]);

// const position = ref(interpolation(props.position))
// const sourcePosition = ref(props.position);

// watch(
//   () => interpolated,
//   (pos) => {
//     // console.log("updating");
//     sourcePosition.value = pos;
//   },
//   { deep: true }
// );

// const position = interpolate(sourcePosition, 500, props.entity.label.en);

// watch(
//   () => position.value,
//   (pos) => {
//     // console.log(`${props.entity.label.en} – position: ${pos.x}`);
//   },
//   { deep: true }
// );

// const transform = computed(
//   () => `translate(${props.position.x} ${props.position.y} )`
// );
// function logPosition() {
//   console.log(props.position.x);
// }
// watchEffect(() => {
//   console.log(`translate(${props.position?.x} ${props.position?.y})`);
// });
</script>

<template>
  <g>
    <BaseInterpolate :props="{ position: props.position }" :delay="500" v-slot="value">
      <g class="node" :transform="`translate(${value.position.x} ${value.position.y})`">
        <foreignObject width="1" height="1">
          <div class="label" @click="$emit('select', props.entity.id)">
            {{ props.entity.label?.en || props.entity.id.slice(0, 6) }}
          </div>
        </foreignObject>
      </g>
    </BaseInterpolate>
  </g>
</template>

<style scoped lang="scss">
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
  }
}
</style>

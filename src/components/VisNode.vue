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
      <g
        class="node"
        :class="`degree-${degree}`"
        :transform="`translate(${value.position.x} ${value.position.y})`"
        @click="$emit('select', props.entity.id)"
      >
        <circle class="dark" r="36" />
        <circle class="light" r="36" />
        <g transform="translate(-30 -30)">
          <foreignObject width="200" height="60">
            <!-- <div class="entity shadow">
              <div class="label">{{ props.entity.label?.en }}</div>
              <div class="type">{{ props.entity.type }}</div>
            </div> -->
            <div class="entity">
              <div class="label">{{ props.entity.label?.en }}</div>
              <div class="type">{{ props.entity.type }}</div>
            </div>
          </foreignObject>
        </g>
      </g>
    </BaseInterpolate>
  </g>
</template>

<style scoped lang="scss">
.node {
  circle {
    fill: none;
    pointer-events: all;
    cursor: pointer;
    mix-blend-mode: darken;
    fill: transparent;
  }
  foreignObject {
    overflow: visible;
    pointer-events: none;
    // position: relative;
    // transition: transform 0.2s;
    // transform-origin: left center;
  }
  .entity {
    position: fixed;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 60px;
    transition: font-weight 0.2s, transform 0.2s;
    transform-origin: left center;

    // position: fixed;
    // color: rgba(var(--gray-4));
    // transform: translate(-50%, -50%);
    font-size: var(--font-size-l);
    &.shadow {
      transition: -webkit-text-stroke 0.2s;
      // -webkit-text-stroke: 5px #e1f5f3;
    }
    // text-shadow: 0 0 2px rgb(var(--teal-10)), 0 0 2px rgb(var(--teal-10)), 0 0 2px rgb(var(--teal-10)),
    // 0 0 2px rgb(var(--teal-10)), 0 0 2px rgb(var(--teal-10));

    .label {
      font-weight: 750;
    }
    .type {
      font-weight: 300;
      text-transform: lowercase;
    }
    // text-align: center;

    // opacity: 0;
  }
  circle.light {
    transition: fill 0.2s, transform 0.2s;
  }
  circle.dark {
    transition: fill 0.2s 1.5s, transform 0.2s;
  }
  &.degree-1 {
    .entity {
      cursor: default;
      transform: scale(1.2);
      &.shadow {
        // -webkit-text-stroke: 5px rgb(var(--teal-7));
      }
    }
    circle {
      cursor: default;
    }
    circle.dark {
      fill: rgb(var(--teal-7));
      transform: scale(1.3);
      transition: fill 0.2s 1.5s, transform 0.2s 1.5s;
    }
  }
  &:hover {
    foreignObject {
      .entity {
        transform: scale(1.1);
        &.shadow {
          // -webkit-text-stroke: 5px rgb(var(--teal-10));
        }
      }
    }
    circle.light {
      fill: rgb(var(--teal-10));
      transform: scale(1.2);
    }
    &.degree-1 {
      foreignObject {
        .entity {
          transform: scale(1.2);
          &.shadow {
            // -webkit-text-stroke: 5px rgb(var(--teal-7));
          }
        }
      }
      circle.light {
        fill: none;
        transform: scale(1);
      }
    }
  }
}
</style>

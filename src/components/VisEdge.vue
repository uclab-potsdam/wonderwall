<script setup>
import { computed, watch, ref } from "vue";
import { easeQuad } from "d3-ease";
import BaseInterpolate from "@/components/BaseInterpolate.vue";

const props = defineProps(["source", "target", "label", "degree", "stroke", "next", "origin"]);

const path = computed(() => {
  const source = { x: props.source.x, y: props.source.y };
  const target = { x: props.target.x, y: props.target.y };
  const delta = { x: target.x - source.x, y: target.y - source.y };

  const l1 =
    props.origin === props.source.id ? { x: delta.x * 0.1, y: delta.y * 0.25 } : { x: delta.x * 0.2, y: delta.y * 0.0 };
  const c1 =
    props.origin === props.source.id ? { x: delta.x * 0.2, y: delta.y * 0.5 } : { x: delta.x * 0.6, y: delta.y * 0.0 };
  const c2 =
    props.origin === props.source.id ? { x: delta.x * 0.4, y: delta.y * 1.0 } : { x: delta.x * 0.8, y: delta.y * 0.5 };
  const l2 =
    props.origin === props.source.id ? { x: delta.x * 0.8, y: delta.y * 1.0 } : { x: delta.x * 0.9, y: delta.y * 0.75 };

  return `M${source.x},${source.y} L${source.x + l1.x},${source.y + l1.y}
  C${source.x + c1.x},${source.y + c1.y} ${source.x + c2.x},${source.y + c2.y} ${source.x + l2.x},${source.y + l2.y}
  L${target.x},${target.y}`;
});

const phase = ref("IDLE");
const step = 500;
const points = ref([]);
const svgPath = ref(null);
const resolution = 60;
let startTime = null;
const wormPath = ref("M0,0L0,0");

function worm(time) {
  if (phase.value === "IDLE") {
    wormPath.value = "M0,0L0,0";
    startTime = null;
    return;
  }
  if (phase.value === "MID") {
    startTime = null;
    return;
  }
  if (startTime === null) {
    startTime = time;
  }
  let progress = easeQuad(Math.min(((time - startTime) / step) * 2, 1));

  const reverse = props.next === props.source.id;
  const wormPoints = points.value.filter((point) => {
    if (!reverse) {
      return phase.value === "END" ? point.progress >= progress : point.progress <= progress;
    } else {
      return phase.value === "END" ? point.progress <= 1 - progress : point.progress >= 1 - progress;
    }
  });
  wormPath.value =
    wormPoints.length > 1
      ? `M${wormPoints.map((point) => `${point.x},${point.y}`).join(`L`)}`
      : `M${wormPoints[0]?.x || 0},${wormPoints[0]?.y || 0}L${wormPoints[0]?.x || 0},${wormPoints[0]?.y || 0}`;
  requestAnimationFrame(worm);
}

function samplePath(path) {
  let points = [];
  const length = path.value.getTotalLength();
  for (let i = 0; i <= resolution; i++) {
    let point = path.value.getPointAtLength((length / resolution) * i);
    points.push({
      x: point.x,
      y: point.y,
      progress: i / resolution,
    });
  }
  return points;
}

watch(
  () => props.next,
  (next) => {
    if (next != null) {
      phase.value = "START";
      points.value = samplePath(svgPath);
      requestAnimationFrame(worm);
      setTimeout(() => {
        phase.value = "MID";
        setTimeout(() => {
          phase.value = "END";
          points.value = samplePath(svgPath);
          requestAnimationFrame(worm);
          setTimeout(() => {
            phase.value = "IDLE";
          }, step);
        }, step * 1.5);
      }, step);
    }
  }
);
</script>

<template>
  <g class="link" :class="[`degree-${props.degree}`]">
    <BaseInterpolate :props="{ path, stroke }" :delay="500" v-slot="value">
      <path ref="svgPath" stroke-width="80" :d="value.path" class="broad" :stroke="value.stroke" />
      <template v-if="props.next != null">
        <path v-if="phase === 'MID'" stroke-width="72" :d="value.path" class="broad next" />
        <path v-else stroke-width="72" :d="wormPath" class="broad next" />
      </template>
      <g>
        <path
          stroke-width="1"
          :d="value.path.replace(/[^L]+L/, 'M').replace(/L.*/, '')"
          class="fine"
          :id="`path-${props.source.id}-${props.target.id}`"
          marker-end="url(#arrow)"
        />
        <text class="label" v-if="props.degree === 2">
          <textPath
            :href="`#path-${props.source.id}-${props.target.id}`"
            :startOffset="`50%`"
            dominant-baseline="bottom"
          >
            <tspan dy="-4">{{ props.label.replaceAll("_", " ") }}</tspan>
          </textPath>
        </text>
      </g>
    </BaseInterpolate>
  </g>
</template>

<style scoped lang="scss">
.link {
  mix-blend-mode: darken;
  .label {
    text-anchor: middle;
    font-size: var(--font-size);
    fill: rgb(var(--blue-gray-2));
    text-transform: uppercase;
  }

  path {
    fill: none;
    &.broad {
      stroke-linecap: round;
      &.next {
        stroke: rgb(var(--teal-7));
        // opacity: 0.8;
        // filter: blur(10px);
      }
    }
    &.fine {
      stroke: rgb(var(--blue-gray-2));
    }
  }

  &.degree-2 {
    path {
      // stroke: rgb(var(--blue-gray-2));
      // &.broad {
      //   transition: stroke 0.75s 0.75s ease-in-out, opacity 0.75s 0.75s ease-in-out;
      //   // stroke: rgb(var(--indigo-10));

      //   &.history {
      //     stroke: rgb(var(--gold-5));
      //   }
      // }
    }
  }

  &.degree-3 {
    path {
      opacity: 0.4;
      &.fine {
        opacity: 0.07;
      }
      // stroke: rgb(var(--blue-gray-2));
      &.broad {
        filter: blur(20px);
        // transition: stroke 0.75s ease-in-out, opacity 0.75s ease-in-out;
        // stroke: rgb(var(--blue-gray-11));
        // &.no-history {
        //   opacity: 0.8;
        // }

        // &.history {
        //   stroke: rgb(var(--gold-5));
        // }
      }
    }
  }
  &.history {
    path {
      // stroke: rgb(var(--gold-5));
      // transition: stroke 0.75s ease-in-out, opacity 0.75s ease-in-out;
      // &.broad {

      //   stroke: rgb(var(--blue-gray-11));
      //   &.no-history {
      //     opacity: 0.8;
      //   }

      //   &.history {
      //     stroke: rgb(var(--gold-5));
      //   }
      // }
    }
  }
}
</style>

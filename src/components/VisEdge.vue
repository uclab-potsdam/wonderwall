<script setup>
import { computed } from "vue";
import BaseInterpolate from "@/components/BaseInterpolate.vue";

const props = defineProps(["source", "target", "label", "degree", "history"]);

const path = computed(() => {
  const source = { x: props.source.x, y: props.source.y };
  const target = { x: props.target.x, y: props.target.y };

  return `M${source.x},${source.y}L${target.x},${target.y}`;
});
</script>

<template>
  <g class="link" :class="[`degree-${props.degree}`, { history: props.history }]">
    <BaseInterpolate :props="{ path }" :delay="500" v-slot="value">
      <template v-if="props.history">
        <path stroke-width="80" :d="value.path" class="broad" :opacity="1 / (props.history + 1)" />
      </template>
      <template v-else>
        <path stroke-width="80" :d="value.path" class="broad no-history" />
        <!-- <path
        v-if="props.history >= 0"
        stroke-width="80"
        :d="value.path"
        class="broad history"
        :opacity="1 / (props.history + 1)"
      /> -->
        <g v-if="props.degree === 2">
          <path stroke-width="1" :d="value.path" class="fine" :id="`path-${props.source.id}-${props.target.id}`" />
          <text class="label" v-if="props.degree === 2">
            <textPath
              :href="`#path-${props.source.id}-${props.target.id}`"
              :startOffset="`50%`"
              dominant-baseline="bottom"
            >
              <tspan dy="-4">→ {{ props.label.replaceAll("_", " ") }} →</tspan>
            </textPath>
          </text>
        </g>
      </template>
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
    &.broad {
      // mix-blend-mode: darken;
      stroke-linecap: round;
      &.history {
        transform: translate(10px, -10px);
        // opacity: 0;
        // filter: blur(50px);
      }
    }
  }

  &.degree-2 {
    path {
      stroke: rgb(var(--blue-gray-2));
      &.broad {
        transition: stroke 0.75s 0.75s ease-in-out, opacity 0.75s 0.75s ease-in-out;
        stroke: rgb(var(--indigo-10));

        &.history {
          stroke: rgb(var(--gold-5));
        }
      }
    }
  }

  &.degree-3 {
    path {
      stroke: rgb(var(--blue-gray-2));
      &.broad {
        transition: stroke 0.75s ease-in-out, opacity 0.75s ease-in-out;
        stroke: rgb(var(--blue-gray-11));
        &.no-history {
          opacity: 0.8;
        }

        &.history {
          stroke: rgb(var(--gold-5));
        }
      }
    }
  }
  &.history {
    path {
      stroke: rgb(var(--gold-5));
      transition: stroke 0.75s ease-in-out, opacity 0.75s ease-in-out;
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

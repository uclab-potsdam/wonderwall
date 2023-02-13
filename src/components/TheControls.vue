<script setup>
import { useSyncStore } from "@/stores/sync";
import { useDataStore } from "@/stores/data";
import { computed, ref } from "vue";

const syncStore = useSyncStore();
const dataStore = useDataStore();

const formattedTime = computed(() => formatTime(syncStore.time));

const timestamps = computed(() => {
  return dataStore.activeEntityTimestamps.map((time) => {
    return {
      time,
      progress: time / syncStore.duration,
    };
  });
});

function formatTime(seconds) {
  const s = `${Math.floor(seconds) % 60}`.padStart(2, 0);
  const m = `${Math.floor(seconds / 60) % 60}`.padStart(2, 0);
  const totalHours = Math.floor(syncStore.duration / 60 / 60);
  const h = `${Math.floor(seconds / 60 / 60)}`.padStart(`${totalHours}`.length, 0);
  return totalHours > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

const userProgress = ref(null);
const userTime = ref(null);
const formattedUserTime = ref(null);
const progressBarWidth = ref(0);
const progressBarX = ref(0);

function initProgress(e) {
  progressBarWidth.value = e.target.getBoundingClientRect().width;
  progressBarX.value = e.target.getBoundingClientRect().x;
}

function showProgress(e) {
  userProgress.value = (e.clientX - progressBarX.value) / progressBarWidth.value;
  userTime.value = userProgress.value * syncStore.duration;
  formattedUserTime.value = formatTime(userTime.value);
}

function hideProgress() {
  userProgress.value = null;
}

function setProgress(time) {
  syncStore.setTime(time || userTime.value);
}
</script>

<template>
  <div class="controls">
    <div class="button-group">
      <div role="button" class="play">P</div>
      <div role="button" class="play">M</div>
    </div>
    <div
      class="progress-bar"
      @mousemove="showProgress"
      @mouseenter="initProgress"
      @click="setProgress()"
      @mouseleave="hideProgress"
    >
      <div class="user-time" v-if="userProgress" :style="{ left: `${userProgress * 100}%` }">
        <div class="value">{{ formattedUserTime }}</div>
        <div class="tick" />
      </div>
      <div class="backdrop" />
      <div class="progress" :style="{ width: `${syncStore.progress * 100}%` }" />
      <div class="timestamps">
        <div
          class="timestamp"
          v-for="(ts, i) in timestamps"
          :key="i"
          :style="{ left: `${ts.progress * 100}%` }"
          @click.stop="setProgress(ts.time)"
        />
      </div>
    </div>
    <div class="time">{{ formattedTime }}</div>
  </div>
</template>

<style scoped lang="scss">
.controls {
  position: absolute;
  display: grid;
  grid-template-columns: auto 1fr auto;
  padding: var(--spacing-l);
  gap: var(--spacing-l);
  width: 100vw;
  height: 60px;
  // background: black;
  bottom: 0px;

  > div {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: rgb(var(--gray-11));
    font-weight: var(--bold);
    // background: red;
  }

  .button-group {
    gap: var(--spacing);
    > div {
      &.active {
        color: rgb(var(--teal-5));
      }
      &:hover {
        color: rgb(var(--teal-1));
      }
      transition: color 0.5s;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 20px;
      height: 20px;
      border: 1.5px solid currentColor;
      border-radius: 50%;
    }
  }
  .progress-bar {
    position: relative;
    > div {
      pointer-events: none;
      position: absolute;
    }
    .backdrop {
      height: 2px;
      width: 100%;
      border-radius: 1px;
      background: currentColor;
    }
    .progress {
      height: 2px;
      border-radius: 1px;
      background: rgb(var(--teal-5));
    }
    .user-time {
      transform: translate(-50%, -20px);
      display: flex;
      justify-content: center;
      align-items: top;
      // color: rgb(var(--teal-5));
      .tick {
        position: absolute;
        width: 2px;
        height: 5px;
        top: 15px;
        background: currentColor;
      }
      .value {
        position: absolute;
      }
    }
    .timestamps {
      position: absolute;
      width: 100%;
      .timestamp {
        pointer-events: all;
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgb(var(--teal-5));
        transform: translate(-50%, 50%);
        transition: transform 0.2s, background 0.2s;

        &:hover {
          transform: translate(-50%, 50%) scale(1.4);
          background: rgb(var(--teal-6));
        }
      }
    }
  }
  .time {
    justify-content: flex-end;
    font-feature-settings: "tnum";
  }
}
</style>

<script setup>
import { useSyncStore } from "@/stores/sync";
import { useDataStore } from "@/stores/data";
import { computed, onMounted, onUnmounted, ref } from "vue";

import IconPlay from "~icons/default/play";
import IconPause from "~icons/default/pause";
import IconMute from "~icons/default/mute";
import IconUnmute from "~icons/default/unmute";

const syncStore = useSyncStore();
const dataStore = useDataStore();

const formattedTime = computed(() => formatTime(syncStore.time));

const timestamps = computed(() => {
  return dataStore.currentEntityTimestamps.map((timestamp) => {
    return {
      ...timestamp,
      progress: timestamp.in / syncStore.duration,
      duration: (timestamp.out - timestamp.in) / syncStore.duration,
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
const userLabel = ref(null);
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
  userLabel.value = timestamps.value.find(
    (timestamp) => timestamp.in <= userTime.value && timestamp.out > userTime.value
  )?.label;
}

function hideProgress() {
  userProgress.value = null;
  userLabel.value = null;
}

function setProgress(time) {
  syncStore.setTime(time || userTime.value);
}

function togglePlay() {
  syncStore.togglePlay();
}
function toggleMute() {
  syncStore.toggleMute();
}

let userInteractedTimeout = null;
const showControls = ref(true);

function userInteracted() {
  showControls.value = true;
  clearTimeout(userInteractedTimeout);
  userInteractedTimeout = setTimeout(() => {
    showControls.value = false;
  }, 2500);
}

function onKeyDown({ code }) {
  switch (code) {
    case "Space":
      togglePlay();
      break;
    case "ArrowLeft":
      setProgress(syncStore.time - 5);
      break;
    case "ArrowRight":
      setProgress(syncStore.time + 5);
      break;
  }
  userInteracted();
}

onMounted(() => {
  syncStore.requestDuration();
  window.addEventListener("mousemove", userInteracted);
  window.addEventListener("keydown", onKeyDown);
});
onUnmounted(() => {
  window.removeEventListener("mousemove", userInteracted);
  userInteracted();
});
</script>

<template>
  <Transition name="default">
    <div class="controls" v-if="showControls">
      <div class="button-group">
        <div role="button" class="play" :class="{ active: syncStore.playing }" @click="togglePlay">
          <IconPause v-if="syncStore.playing" /><IconPlay v-else />
        </div>
        <div role="button" class="mute" :class="{ active: syncStore.mute }" @click="toggleMute">
          <IconMute v-if="syncStore.mute" /><IconUnmute v-else />
        </div>
      </div>
      <div
        class="progress-bar"
        @mousemove="showProgress"
        @mouseenter="initProgress"
        @click="setProgress()"
        @mouseleave="hideProgress"
      >
        <div class="backdrop" />
        <div class="progress" :style="{ left: `${syncStore.progress * 100}%` }" />
        <div
          class="user-time"
          :class="{ 'has-label': userLabel }"
          v-if="userProgress"
          :style="{ left: `${userProgress * 100}%` }"
        >
          <div class="value label">{{ userLabel }}</div>
          <div class="value">{{ formattedUserTime }}</div>
          <div class="tick" />
        </div>
        <!-- <div class="timestamps">
        <div
          class="timestamp"
          v-for="(ts, i) in timestamps"
          :key="i"
          :style="{ left: `${ts.progress * 100}%` }"
          :class="{ active: ts.active }"
          @click.stop="setProgress(ts.time)"
        />
      </div> -->
        <div class="timeranges">
          <div
            class="timerange"
            v-for="(ts, i) in timestamps"
            :key="i"
            :style="{ left: `${ts.progress * 100}%`, width: `${ts.duration * 100}%` }"
            :class="{ active: ts.active }"
            @click.stop="setProgress(ts.in)"
          >
            <div class="inner" />
          </div>
        </div>
      </div>
      <div class="time">{{ formattedTime }}</div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.controls {
  position: absolute;
  display: grid;
  grid-template-columns: auto 1fr auto;
  padding: var(--spacing-l);
  gap: var(--spacing-l);
  width: 100vw;
  height: 62px;
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
      &:hover {
        color: rgb(var(--teal-5));
      }
      color: rgb(var(--gray-11));
      transition: color 0.2s;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 24px;
      // border: 1.5px solid currentColor;
      border-radius: 50%;
    }
  }
  .progress-bar {
    position: relative;
    cursor: none;
    > div {
      pointer-events: none;
      position: absolute;
    }
    .backdrop {
      height: 8px;
      width: 100%;
      border-radius: 1px;
      background: rgb(var(--blue-gray-10));
    }
    .progress {
      height: 16px;
      width: 2px;
      border-radius: 1px;
      background: rgb(var(--gray-11));
      z-index: 5;
      // opacity: 0.4;
    }
    .user-time {
      transform: translate(-50%, -24px);
      display: flex;
      // justify-content: center;
      align-items: top;
      // color: rgb(var(--teal-5));
      z-index: 5;
      .tick {
        position: absolute;
        width: 2px;
        height: 32px;
        // top: 15px;
        background: currentColor;
      }
      .value {
        position: absolute;
        margin-left: var(--spacing-s);
        font-feature-settings: "tnum";

        &.label {
          white-space: nowrap;
          transform: translate(0, -100%);
        }
      }
      &.has-label {
        .tick {
          height: 48px;
          transform: translateY(-16px);
        }
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
        background: rgb(var(--teal-10));
        transform: translate(-50%, 50%);
        transition: transform 0.2s, background 0.2s;

        &:hover {
          transform: translate(-50%, 50%) scale(1.4);
          background: rgb(var(--teal-8));
        }

        &.active {
          background: rgb(var(--teal-5));

          &:hover {
            background: rgb(var(--teal-3));
          }
        }
      }
    }
    .timeranges {
      position: absolute;
      width: 100%;
      .timerange {
        pointer-events: all;
        position: absolute;
        // width: 8px;
        height: 24px;
        // border-radius: 50%;
        // opacity: 0.5;
        // background: rgb(var(--red-9));
        transform: translate(0, -50%);
        transition: transform 0.1s, background 0.2s;
        display: flex;
        align-items: center;
        // justify-content: center;

        &:hover {
          .inner {
            transform: scale(1, 1.4);
            background: rgb(var(--teal-7));
          }
        }

        &.active {
          .inner {
            background: rgb(var(--teal-5));
          }

          &:hover {
            .inner {
              background: rgb(var(--teal-3));
            }
          }
        }

        .inner {
          width: 100%;
          height: 8px;
          position: absolute;
          // border-radius: 50%;
          // opacity: 0.5;
          background: rgb(var(--teal-9));
          // transform: translate(0, -50%);
          transition: transform 0.1s, background 0.2s;

          &.active {
            background: rgb(var(--teal-5));

            &:hover {
              background: rgb(var(--teal-3));
            }
          }
        }
      }
    }
    &:hover {
      .progress {
        display: none;
      }
    }
  }
  .time {
    justify-content: flex-end;
    font-feature-settings: "tnum";
  }

  &.default-enter-active,
  &.default-leave-active {
    transition: all 0.2s ease;
  }
  &.default-enter-from,
  &.default-leave-to {
    opacity: 0;
  }
}
</style>

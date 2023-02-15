<script setup>
import { useSyncStore } from "@/stores/sync";
import { useConfigStore } from "@/stores/config";
import { ref, onMounted, watch } from "vue";

const video = ref(null);
const range = [37, 543];
const pip = ref(false);

const syncStore = useSyncStore();
const configStore = useConfigStore();

onMounted(() => {
  requestAnimationFrame(update);
});

function update() {
  let currentTime = video.value?.currentTime;
  if (currentTime < range[0] || currentTime > range[1]) video.value.currentTime = currentTime = range[0];
  syncStore.updateTime(currentTime);
  requestAnimationFrame(update);
}

watch(
  () => syncStore.timeOverwrite,
  () => {
    video.value.currentTime = syncStore.timeOverwrite;
  }
);

watch(
  () => syncStore.playing,
  () => {
    video.value[syncStore.playing ? "play" : "pause"]();
  }
);

watch(
  () => syncStore.mute,
  () => {
    video.value.muted = syncStore.mute;
  }
);

function onVolumeChange() {
  syncStore.setMute(video.value.muted);
}

function setDuration() {
  syncStore.setDuration(video.value.duration);
}

// const videos = Array.from(document.querySelectorAll("video"));
// const channel = new BroadcastChannel("sync");
// let video = videos[0];

// video.preload = "auto";

// function timeUpdate() {
//   const currentTime = video.currentTime;
//   channel.postMessage({
//     type: "timeUpdate",
//     current: currentTime,
//     total: video.duration,
//     paused: video.paused,
//   });
//   requestAnimationFrame(timeUpdate);
// }
// requestAnimationFrame(timeUpdate);
</script>

<template>
  <video
    id="tunnel"
    width="100%"
    loop
    x-autoplay
    muted
    ref="video"
    :class="{ pip }"
    @durationchange="setDuration"
    @enterpictureinpicture="pip = true"
    @leavepictureinpicture="pip = false"
    @play="syncStore.setPlaying(true)"
    @pause="syncStore.setPlaying(false)"
    @volumechange="onVolumeChange"
  >
    <source :src="configStore.videoUrl" type="video/webm" preload />
  </video>
</template>

<style scoped lang="scss">
video {
  background: rgb(var(--gray-0));
  position: absolute;
  object-fit: contain;
  display: block;
  width: 100%;
  height: 100%;
  transition: filter 0.4s, opacity 0.4s;

  &.pip {
    display: none;
  }
}
</style>

import { computed, ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useSyncStore = defineStore("sync", () => {
  const channel = new BroadcastChannel("sync");
  const time = ref(47.4);
  const timeOverwrite = ref(null);
  const playing = ref(false);
  const duration = ref(100);
  const mute = ref(true);
  // const doubleCount = computed(() => count.value * 2);
  function updateTime(t) {
    time.value = t;
    channel.postMessage({
      action: "update_time",
      value: time.value,
    });
  }
  function setTime(t) {
    timeOverwrite.value = t;
    channel.postMessage({
      action: "set_time",
      value: time.value,
    });
  }
  function setDuration(t) {
    duration.value = t;
    channel.postMessage({
      action: "set_duration",
      value: duration.value,
    });
  }
  function setPlaying(p) {
    playing.value = p;
    channel.postMessage({
      action: "set_playing",
      value: playing.value,
    });
  }
  function togglePlay() {
    playing.value = !playing.value;
    channel.postMessage({
      action: "set_playing",
      value: playing.value,
    });
  }
  function setMute(m) {
    mute.value = m;
    channel.postMessage({
      action: "set_mute",
      value: mute.value,
    });
  }
  function toggleMute() {
    mute.value = !mute.value;
    channel.postMessage({
      action: "set_mute",
      value: mute.value,
    });
  }

  function requestDuration() {
    channel.postMessage({
      action: "request_duration",
    });
  }

  const progress = computed(() => time.value / duration.value);

  channel.addEventListener("message", ({ data }) => {
    switch (data.action) {
      case "update_time":
        time.value = data.value;
        break;
      case "set_time":
        timeOverwrite.value = data.value;
        break;
      case "set_playing":
        playing.value = data.value;
        break;
      case "set_mute":
        mute.value = data.value;
        break;
      case "set_duration":
        duration.value = data.value;
        break;
      case "request_duration":
        channel.postMessage({
          action: "set_duration",
          value: duration.value,
        });
        break;
    }
  });

  return {
    channel,
    time,
    playing,
    mute,
    duration,
    progress,
    timeOverwrite,
    updateTime,
    setTime,
    setPlaying,
    setMute,
    setDuration,
    togglePlay,
    toggleMute,
    requestDuration,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSyncStore, import.meta.hot));
}

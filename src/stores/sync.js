import { computed, ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useSyncStore = defineStore("sync", () => {
  const channel = new BroadcastChannel("sync");
  const time = ref(47.4);
  const timeOverwrite = ref(null);
  const playing = ref(true);
  const duration = ref(100);
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
  function setPlaying(p) {
    playing.value = p;
    channel.postMessage({
      action: "set_playing",
      value: playing.value,
    });
  }
  function setDuration(t) {
    duration.value = t;
    channel.postMessage({
      action: "set_duration",
      value: duration.value,
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
      case "set_duration":
        duration.value = data.value;
        break;
    }
  });

  return { channel, time, playing, duration, progress, timeOverwrite, updateTime, setTime, setPlaying, setDuration };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSyncStore, import.meta.hot));
}

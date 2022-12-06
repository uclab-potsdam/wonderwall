import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useSyncStore = defineStore("sync", () => {
  const channel = new BroadcastChannel("sync");
  const time = ref(-1);
  const playing = ref(true);
  // const doubleCount = computed(() => count.value * 2);
  function setTime(t) {
    time.value = t;
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

  channel.addEventListener("message", ({ data }) => {
    switch (data.action) {
      case "set_time":
        time.value = data.value;
        break;
      case "set_playing":
        playing.value = data.value;
        break;
    }
  });

  return { time, playing, setTime, setPlaying };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSyncStore, import.meta.hot));
}

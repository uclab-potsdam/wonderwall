import { ref, watch } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useConfigStore = defineStore("config", () => {
  const highPerformance = ref(JSON.parse(localStorage.getItem("HIGH_PERFORMANCE")) !== false);

  watch(highPerformance, () => {
    localStorage.setItem("HIGH_PERFORMANCE", JSON.stringify(highPerformance.value));
  });

  return {
    highPerformance,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot));
}

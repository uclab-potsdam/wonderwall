<script setup>
import { RouterLink } from "vue-router";
import TheMenuBar from "../components/TheMenuBar.vue";

import { useConfigStore } from "@/stores/config";
const configStore = useConfigStore();
</script>

<template>
  <TheMenuBar />
  <main>
    <section>
      <h2>The Art of the Baniwa Women</h2>
      <RouterLink to="pip">picture in picture</RouterLink>
      <RouterLink to="video">video</RouterLink>
      <RouterLink to="vis">vis</RouterLink>
    </section>
    <section class="config">
      <h2>Config</h2>
      <label><input type="checkbox" v-model="configStore.highPerformance" />high performance</label>
    </section>
  </main>
</template>

<style scoped lang="scss">
main {
  padding: var(--spacing-l);

  section {
    display: flex;
    gap: var(--spacing);

    + section {
      margin-top: var(--spacing-l);
    }
    &.config {
      display: flex;
      flex-direction: column;

      input {
        margin-right: var(--spacing);
      }
    }
  }
}
</style>

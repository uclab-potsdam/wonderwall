<script setup>
import { RouterLink } from "vue-router";
import TheMenuBar from "../components/TheMenuBar.vue";
</script>

<template>
  <TheMenuBar />
  <main>
    <section>
      <h2>The Art of the Baniwa Women</h2>
      <RouterLink to="video">video</RouterLink>
      <RouterLink to="vis">vis</RouterLink>
    </section>
  </main>
</template>

<style scoped lang="scss">
main {
  padding: var(--spacing-l);

  section {
    display: flex;
    gap: var(--spacing);
  }
}
</style>

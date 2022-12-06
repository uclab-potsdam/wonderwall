<script setup>
defineProps({
  msg: {},
});
</script>

<template>
  <header>
    <h1>Wonderwall</h1>
  </header>
</template>

<style scoped lang="scss">
header {
  width: 100%;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-l);
}
</style>

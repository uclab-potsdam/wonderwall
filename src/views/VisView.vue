<script setup>
import TheVis from "@/components/TheVis.vue";
import TheControls from "@/components/TheControls.vue";
</script>
<template>
  <div class="vis">
    <TheVis />
    <TheControls />
  </div>
</template>

<style lang="scss" scoped>
.vis {
  min-height: 100vh;
  /* display: flex; */
  /* align-items: center; */
}
</style>

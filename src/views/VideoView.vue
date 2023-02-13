<script setup>
import TheVideo from "@/components/TheVideo.vue";
import TheControls from "@/components/TheControls.vue";
</script>
<template>
  <div class="video">
    <TheVideo />
    <TheControls />
  </div>
</template>

<style lang="scss" scoped>
.video {
  min-height: 100vh;
  /* display: flex; */
  /* align-items: center; */
}
</style>

<script setup>
import TheVis from "@/components/TheVis.vue";
import TheVideo from "@/components/TheVideo.vue";
</script>
<template>
  <div class="vis">
    <div class="video">
      <TheVideo />
    </div>
    <TheVis />
  </div>
</template>

<style lang="scss" scoped>
.vis {
  min-height: 100vh;
  /* display: flex; */
  /* align-items: center; */

  .video {
    --width: 300px;
    --ratio: calc(16 / 9);
    opacity: 0.5;
    position: absolute;
    z-index: 1;
    top: var(--spacing);
    right: var(--spacing);
    width: var(--width);
    height: calc(var(--width) / var(--ratio));
    border-radius: var(--spacing-s);
    overflow: hidden;
    box-shadow: 2px 2px 10px 0 rgba(var(--blue-gray-0), 0.8);
  }
}
</style>

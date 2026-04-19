<template>
  <section class="subapp-section">
    <div id="subapp"></div>
  </section>
</template>

<script setup lang='ts'>
import { start } from 'qiankun'
import { onMounted } from 'vue';

onMounted(() => {
  if (!window.qiankunStarted) {
    start({
      prefetch: false,
      // sandbox: {
      //   experimentalStyleIsolation: true,
      // },
    })
    window.qiankunStarted = true
  }
})
</script>
<style scoped>
</style>
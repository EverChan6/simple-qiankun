<template>
  <div class="layout">
    <LayoutHeader />

    <div class="layout-body">
      <LayoutSidebar />

      <div class="layout-main">
        <div id="subapp"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { registerMicroApps, start } from 'qiankun'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSubappStore } from '@/stores/subapp'
import bus from '@/utils/bus';
import LayoutHeader from './LayoutHeader.vue'
import LayoutSidebar from './LayoutSidebar.vue'


const store = useSubappStore()
const { subapp } = storeToRefs(store)

onMounted(async () => {
  await store.fetchSubapp()
  registerMicroApps(subapp.value)
  if (!window.qiankunStarted) {
    start({
      prefetch: false,
      // sandbox: {
      //   experimentalStyleIsolation: true,
      // },
    })
    window.qiankunStarted = true
  }
  bus.on('sendMsg', (data) => {
    console.log(1111111, data)
  });
})
</script>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-body {
  flex: 1;
  display: flex;
}

.layout-main {
  flex: 1;
  /* background: #0f172a; */
  padding: 16px;
}
</style>

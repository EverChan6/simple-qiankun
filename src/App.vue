<script setup lang="ts">
import { registerMicroApps, start } from 'qiankun'
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia'
import { useSubappStore } from '@/stores/subapp'
import bus from '@/utils/bus'
import { RouterView } from 'vue-router'

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

<template>
  <RouterView v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
</template>

<style scoped></style>
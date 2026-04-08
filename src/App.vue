<script setup lang="ts">
import { registerMicroApps, start } from 'qiankun'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSubappStore } from './stores/subapp'

const store = useSubappStore()
const { subapp } = storeToRefs(store)

onMounted(async () => {
  await store.fetchSubapp()
  registerMicroApps(subapp.value)
  start()
})
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <div id="subapp"></div>
</template>

<style scoped></style>

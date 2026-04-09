<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSubappStore } from '@/stores/subapp'
import { useRouter } from 'vue-router'

const activeApp = ref(null)
const store = useSubappStore()
const router = useRouter()

const { subapp } = storeToRefs(store)
const filteredApps = computed(() => {
  return subapp.value
  // return subapp.value.filter(app =>
  //   app.name.toLowerCase().includes(keyword.value.toLowerCase())
  // )
})
function openApp(app) {
  activeApp.value = app
  // 这里接入 qiankun loadMicroApp
  console.log('load sub app:', app)
  router.push(app.activeRule)
}

function openNew(app) {
  window.open(app.entry)
}
</script>

<template>
  <aside class="sidebar">
    <div
      v-for="app in filteredApps"
      :key="app.name"
      class="card"
      :class="{ active: activeApp?.name === app.name }"
      @click="openApp(app)"
    >
      <div class="title">{{ app.name }}</div>
      <div class="desc">{{ app.desc }}</div>
      <div class="tags">
        <span v-for="tag in app.tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="footer">
        <span :class="['status', app.status]">{{ app.status }}</span>
        <button @click.stop="openNew(app)">↗</button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background: #f5f5f5;
  padding: 20px;
}
.card {
  /* background: #1e293b; */
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initMicroAppState } from '@/microApp'
import App from './App.vue'
import router from './router'

// 初始化全局状态（必须在 start() 之前）
initMicroAppState()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

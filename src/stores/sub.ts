import { ref } from 'vue'
import { defineStore } from 'pinia'

// 保存子应用的路由信息，可用于权限校验、菜单高亮等
export const useSubStore = defineStore('sub', () => {
  const subRouter = ref(null) // 当前子应用路由对象实例，由子应用传递过来
  const routers = ref({})
  const singleEl = ref<HTMLElement | null>(null)

  const setSubRouter = (router: any) => {
    subRouter.value = router
  }

  const setRouters = (routers: any) => {
    routers.value = routers
  }

  const setSingleEl = (el: HTMLElement | null) => {
    singleEl.value = el
  }

  return { subRouter, routers, singleEl, setSubRouter, setRouters, setSingleEl }
})

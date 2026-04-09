import { initGlobalState, type MicroAppStateActions } from 'qiankun'
import { useSubStore } from '@/stores/sub'

let actions: MicroAppStateActions | null = null

// 初始化全局状态 - 必须在 start() 之前调用
export function initMicroAppState() {
  if (actions) return actions

  const initialState = {
    subRouter: null,
    routers: {},
    singleEl: null,
  }
  actions = initGlobalState(initialState)

  actions.onGlobalStateChange((state, prev) => {
    console.log({ state, prev })
    const subStore = useSubStore()
    subStore.setSubRouter(state.subRouter)
    subStore.setRouters(state.routers)
    subStore.setSingleEl(state.singleEl)
  })

  return actions
}

export default actions

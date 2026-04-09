import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import MockSubapps, { type SubApp } from '@/config/subapps'

export const useSubappStore = defineStore('subapp', () => {
  const subapp = ref<SubApp[]>([]) // 所有资源
  const filteredSubapp = computed(() => subapp.value) // 过滤后的资源，可根据用户角色过滤拥有的权限资源
  async function fetchSubapp() {
    // TODO: fetch subapp list
    subapp.value = import.meta.env.DEV ? MockSubapps : []
  }

  return { subapp, filteredSubapp, fetchSubapp }
})

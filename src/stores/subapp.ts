import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import MockSubapps, { type SubApp } from '@/subapps'

export const useSubappStore = defineStore('subapp', () => {
  const subapp = ref<SubApp[]>([])
  const filteredSubapp = computed(() => subapp.value)
  async function fetchSubapp() {
    // TODO: fetch subapp list
    subapp.value = import.meta.env.DEV ? MockSubapps : []
  }

  return { subapp, filteredSubapp, fetchSubapp }
})

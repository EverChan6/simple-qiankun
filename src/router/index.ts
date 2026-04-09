import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/subapp',
    },
    {
      path: '/subapp/:pathMatch(.*)*',
      name: 'subapp',
      component: () => import('@/components/LayoutMain.vue'),
    },
  ],
})

export default router

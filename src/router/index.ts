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
      component: () => import('@/views/Home.vue'),
    },
  ],
})

export default router

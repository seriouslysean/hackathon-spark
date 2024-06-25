// index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '~views/HomeView.vue'

export const ROUTE_HOME = 'home'
export const ROUTE_RELEASE = 'release'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_HOME,
      component: HomeView
    },
    {
      path: '/release',
      name: ROUTE_RELEASE,
      component: () => import('~views/ReleaseView.vue'),
      props: true
    }
  ]
})

export default router

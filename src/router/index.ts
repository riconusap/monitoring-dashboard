import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import KnowledgebaseView from '@/views/KnowledgebaseView.vue'

// Use hash history for GitHub Pages compatibility
const router = createRouter({
  history: import.meta.env.PROD 
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: DashboardView
    },
    {
      path: '/knowledgebase',
      name: 'Knowledgebase',
      component: KnowledgebaseView
    },
  ]
})

export default router
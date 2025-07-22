import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PersonalLayout from '@/layouts/PersonalLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'HomeIndex',
        component: () => import('@/views/Home/HomeIndex.vue'),
      },
      {
        path: '/community',
        name: 'CommunityHub',
        component: () => import('@/views/CommunityHub/CommunityHub.vue'),
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About/About.vue'),
      },
      {
        path: '/auth',
        name: 'Auth',
        component: () => import('@/views/Auth/AuthIndex.vue'),
      },
    ],
  },
  {
    path: '/personal',
    component: PersonalLayout,
    children: [
      {
        path: '',
        name: 'PersonalDashboard',
        component: () => import('@/views/Personal/Dashboard.vue'),
      },
      {
        path: 'tarvel-article-post',
        name: 'TravelNotePost',
        component: () => import('@/views/Personal/TravelNotePost.vue'),
      },
      {
        path: 'article-manage',
        name: 'ArticleManage',
        component: () => import('@/views/Personal/ArticleManage.vue'),
      },
      {
        path: 'make-plan',
        name: 'MakePlan',
        component: () => import('@/views/Personal/Plan.vue'),
      },
      {
        path: 'emotion-map-make',
        name: 'EmotionMapMake',
        component: () => import('@/views/Personal/EmotionMapMake.vue'),
      },
      {
        path: 'setting',
        name: 'Setting',
        component: () => import('@/views/Personal/Setting.vue'),
      },
      {
        path: 'QA',
        name: 'QA',
        component: () => import('@/views/Personal/QA.vue'),
      },
    ],
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

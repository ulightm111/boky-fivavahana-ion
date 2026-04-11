import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/books'
  },
  {
    path: '/books',
    component: () => import('../views/BooksView.vue')
  },
  {
    path: '/search',
    component: () => import('../views/SearchResultsView.vue')
  },
  {
    path: '/books/:bookId',
    component: () => import('../views/BookIndexView.vue')
  },
  {
    path: '/books/:bookId/group/:groupName',
    component: () => import('../views/SongListView.vue')
  },
  {
    path: '/books/:bookId/song/:songId',
    component: () => import('../views/ContentView.vue')
  },
  {
    path: '/books/:bookId/section/:sectionName',
    component: () => import('../views/ContentView.vue')
  },
  {
    path: '/books/:bookId/section/:sectionName/subsection/:subIndex',
    component: () => import('../views/ContentView.vue')
  },
  {
    path: '/settings',
    component: () => import('../views/SettingsView.vue')
  },
  {
    path: '/about',
    component: () => import('../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

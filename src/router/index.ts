import { createRouter, createWebHistory } from 'vue-router'
// 导入组件（可根据实际项目创建）
import Home from '../views/Home.vue'
// import About from '../views/About.vue'
import Chat from '../views/Chat/index.vue'
import Charts from '../views/Charts/index.vue'
import Photos from '../views/Photos/index.vue'
import Poster from '../views/Poster/index.vue'
import WordCloud from '../views/WordCloud/index.vue'

// 路由规则
const routes: any = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: About
  //   // 也可以使用懒加载（推荐）：
  //   // component: () => import('../views/About.vue')
  // },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/charts',
    name: 'Charts',
    component: Charts
  },
  {
    path: '/photos',
    name: 'Photos',
    component: Photos
  },
  {
    path: '/poster',
    name: 'Poster',
    component: Poster
  },
  {
    path: '/wordCloud',
    name: 'WordCloud',
    component: WordCloud
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 使用 HTML5 历史模式
  routes // 传入路由规则
})

export default router

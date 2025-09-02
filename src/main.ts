import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 导入路由配置
// 引入 Element Plus
// import ElementPlus from 'element-plus'
// 引入 Element Plus 样式
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 引入中文语言包（可选，默认是英文）
// import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(router) // 使用路由
  // .use(ElementPlus)
  .mount('#app')

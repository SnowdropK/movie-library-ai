import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// 引入 Element Plus 按需导入插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
   // 1. 解决生产环境路径问题（如果部署在子目录，需修改为对应路径，如 '/movie/'）
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // 确保有这个配置
    },
  },
  plugins: [
    vue(),
    // 自动导入 Element Plus 相关函数（如 ElMessage）
    AutoImport({
      resolvers: [ElementPlusResolver({
        // 配置语言包（中文）
        // 'locale': 'zh-cn'
      })],
    }),
    // 自动导入 Element Plus 组件
    Components({
      resolvers: [ElementPlusResolver({
        // 配置语言包（中文）
        // locale: 'zh-cn'
      })],
    }),
  ],
  // 构建配置（确保资源正确输出）
  build: {
    outDir: 'dist', // 输出目录（默认即可）
    assetsDir: 'assets', // 静态资源目录（默认即可）
    sourcemap: false, // 生产环境关闭 sourcemap，减少体积
    rollupOptions: {
      output: {
        // 明确指定资源路径
        assetFileNames: 'assets/[name]-[hash].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
})




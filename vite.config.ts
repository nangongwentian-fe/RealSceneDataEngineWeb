import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import path from "path"
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    UnoCSS(),
    vueDevTools(),
  ],
  resolve: {
    // 配置路径别名
    alias: {
        '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/tags': {
        target: 'http://172.31.70.135:8888',
        changeOrigin: true,
      },
      '/projects': {
        target: 'http://172.31.70.135:8888',
        changeOrigin: true,
      },
      '/upload': {
        target: 'http://172.31.70.135:8888',
        changeOrigin: true,
      },
      '/data-resources': {
        target: 'http://172.31.70.135:8888',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://172.31.70.135:8888',
        changeOrigin: true,
      },
      '/sse': {
        target: 'http://172.31.70.135:8888',
        changeOrigin: true,
      },
      '/three-d-gs': {
        target: 'http://172.31.70.135:8888',
        changeOrigin: true,
      },
    },
  },
})

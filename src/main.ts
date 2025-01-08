import { createApp } from 'vue'
import "@/assets/styles/global.scss"
import App from './App.vue'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'uno.css'
import { router } from './router'
import { createPinia } from 'pinia'

const app = createApp(App)

const pinia = createPinia();

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(pinia).use(router).mount('#app')

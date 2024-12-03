import { createApp } from 'vue'
import md5 from 'js-md5'
import App from './App.vue'

// 本地SVG图标
import 'virtual:svg-icons-register'

// 样式
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/styles/index.scss'
import 'uno.css'
import 'animate.css'

const app = createApp(App)
// app.use(setupPlugins)
app.provide('md5', md5) // 依赖注入
app.mount('#app')

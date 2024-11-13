import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persistedState from 'pinia-plugin-persistedstate';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'

const pinia = createPinia()
pinia.use(persistedState);
const app = createApp(App)

app.use(pinia)
app.use(ElementPlus)
app.mount('#app')

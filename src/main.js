import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Crear instancia de la app
const app = createApp(App)

// Configurar Pinia (state management)
const pinia = createPinia()
app.use(pinia)

// Configurar Vue Router
app.use(router)

// Montar la aplicación
app.mount('#app')

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { reportClientError } from './lib/observability'

// Crear instancia de la app
const app = createApp(App)

// Configurar Pinia (state management)
const pinia = createPinia()
app.use(pinia)

// Configurar Vue Router
app.use(router)

// Montar la aplicación
app.mount('#app')

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      reportClientError('pwa.service_worker_register', error)
    })
  })
}

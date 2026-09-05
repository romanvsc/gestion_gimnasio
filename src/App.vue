<template>
  <div id="app" class="min-h-screen">
    <!-- Mostrar loading mientras se inicializa la sesión -->
    <div v-if="userStore.loading" class="min-h-screen flex items-center justify-center bg-page-bg transition-colors duration-200">
      <div class="text-center">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
    <!-- Una vez inicializado, mostrar el contenido -->
    <router-view v-else v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
    
    <!-- Toaster Global para notificaciones - Estilizado Premium -->
    <Toaster 
      position="top-center" 
      :richColors="true"
      :expand="true"
      :visibleToasts="3"
      :toastOptions="{
        style: {
          padding: '16px 20px',
          borderRadius: '16px',
          fontSize: '15px',
          fontWeight: '500',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
          background: 'white',
          border: 'none',
          gap: '12px'
        },
        className: 'premium-toast',
        descriptionClassName: 'toast-description'
      }"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Toaster } from 'vue-sonner'
import { useUserStore } from './stores/userStore'
import { useSettings } from './composables/useSettings'
import { useTheme } from './composables/useTheme'

const userStore = useUserStore()
const { fetchSettings } = useSettings()
// Inicializar tema (lee localStorage y aplica clase dark en <html>)
const { isDark } = useTheme()

// Inicializar la sesión al cargar la app
onMounted(async () => {
  await userStore.initSession()
  
  // Cargar configuración global del gimnasio
  await fetchSettings()
})
</script>

<style scoped>
/* Estilos específicos del componente principal si son necesarios */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>

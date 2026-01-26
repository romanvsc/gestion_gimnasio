<template>
  <div id="app" class="min-h-screen">
    <!-- Mostrar loading mientras se inicializa la sesión -->
    <div v-if="userStore.loading" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent mb-4"></div>
        <p class="text-gray-600">Cargando...</p>
      </div>
    </div>
    <!-- Una vez inicializado, mostrar el contenido -->
    <router-view v-else v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="componentKey" />
      </Transition>
    </router-view>
    
    <!-- Toaster Global para notificaciones -->
    <Toaster position="top-center" :richColors="true" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Toaster } from 'vue-sonner'
import { useUserStore } from './stores/userStore'
import { useSettings } from './composables/useSettings'
import { supabase } from './lib/supabase'

const userStore = useUserStore()
const { fetchSettings } = useSettings()
const componentKey = ref(0)
let debounceTimer = null

/**
 * Maneja el retorno del usuario a la pestaña
 * PRIMERO refresca el token, LUEGO recarga la vista
 * DEBOUNCE: Solo ejecuta 1 vez cada 1000ms para evitar race conditions
 */
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible') {
    // DEBOUNCE: Cancelar timer anterior si existe
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Ejecutar después de 1000ms de silencio
    debounceTimer = setTimeout(async () => {
      console.log('🔄 Despertando app...')
      
      try {
        // 1. FORZAR REFRESCO DE TOKEN EXPLÍCITO
        // Esto "despierta" la conexión interna de Auth que estaba dormida
        const { data, error } = await supabase.auth.refreshSession()
        
        if (error || !data.session) {
          console.warn('⚠️ Token expirado o inválido. Redirigiendo al login...')
          await userStore.logout()
          return
        }
        
        console.log('✅ Token refrescado. Recargando vista...')
        // 2. SOLO si el token revivió, recargamos la vista
        componentKey.value += 1
      } catch (err) {
        console.error('Error refrescando sesión:', err)
        // En caso de error grave, mandamos al login
        await userStore.logout()
      }
    }, 1000) // Debounce de 1000ms
  }
}

// Inicializar la sesión al cargar la app
onMounted(async () => {
  await userStore.initSession()
  
  // Cargar configuración global del gimnasio
  await fetchSettings()
  
  // Agregar listener para detectar cuando el usuario vuelve a la pestaña
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
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

<template>
  <div id="app" class="min-h-screen">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/userStore'

const userStore = useUserStore()

// Inicializar la sesión al cargar la app
onMounted(async () => {
  await userStore.initSession()
})
</script>

<style scoped>
/* Estilos específicos del componente principal si son necesarios */
</style>

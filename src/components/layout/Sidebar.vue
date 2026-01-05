<template>
  <aside class="hidden md:flex md:flex-shrink-0">
    <div class="flex flex-col w-64">
      <div class="flex flex-col h-0 flex-1 bg-gray-800">
        <!-- Logo/Header -->
        <div class="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <h1 class="text-white text-xl font-bold">Gimnasio</h1>
        </div>

        <!-- Navigation -->
        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-2 py-4 space-y-1">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              :class="[
                isActive(item.to) 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
              ]"
            >
              <span class="text-xl mr-3">{{ item.icon }}</span>
              {{ item.name }}
            </router-link>
          </nav>
        </div>

        <!-- User section -->
        <div class="flex-shrink-0 flex bg-gray-700 p-4">
          <div class="flex items-center w-full">
            <div class="flex-1">
              <p class="text-sm font-medium text-white">{{ userStore.userEmail }}</p>
              <p class="text-xs text-gray-300">
                {{ userStore.isAdmin ? 'Admin' : 'Staff' }}
              </p>
            </div>
            <button
              @click="handleLogout"
              class="ml-2 text-gray-300 hover:text-white transition-colors"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const navigation = [
  { name: 'Dashboard', to: '/' },
  { name: 'Socios', to: '/miembros' },
  { name: 'Check-In', to: '/checkin' },
  { name: 'Pagos', to: '/pagos/nuevo' }
]

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

async function handleLogout() {
  await userStore.logout()
  router.push({ name: 'Login' })
}
</script>
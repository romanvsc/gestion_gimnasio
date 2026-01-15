<template>
  <aside class="hidden md:flex md:flex-shrink-0">
    <div class="flex flex-col w-64">
      <div class="flex flex-col h-0 flex-1 bg-gray-800">
        <!-- Logo/Header -->
        <div class="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <img 
            v-if="settings.logo_url" 
            :src="settings.logo_url" 
            :alt="settings.nombre_gimnasio"
            class="h-10 max-w-full object-contain"
          >
          <h1 v-else class="text-white text-xl font-bold">
            {{ settings.nombre_gimnasio }}
          </h1>
        </div>

        <!-- Navigation -->
        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-2 py-4 space-y-2">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              :class="[
                isActive(item.to) 
                  ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white border-l-4 border-transparent',
                'group flex items-center px-4 py-3 text-sm font-medium rounded-r-md transition-all duration-200'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3" />
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
              class="ml-2 p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded-md transition-colors"
              title="Cerrar sesión"
            >
              <LogOut class="w-5 h-5" />
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
import { toast } from 'vue-sonner'
import { useUserStore } from '@/stores/userStore'
import { useSettings } from '@/composables/useSettings'
import { confirmAlert } from '@/lib/alerts'
import { LayoutDashboard, Users, CheckCircle, DollarSign, Wallet, Settings, BarChart3, LogOut } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { settings } = useSettings()

const navigationItems = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Socios', to: '/miembros', icon: Users },
  { name: 'Check-In', to: '/checkin', icon: CheckCircle },
  { name: 'Pagos', to: '/pagos/nuevo', icon: DollarSign },
  { name: 'Reportes', to: '/reports', icon: BarChart3, adminOnly: true },
  { name: 'Caja', to: '/caja', icon: Wallet, adminOnly: true },
  { name: 'Usuarios', to: '/staff', icon: Settings, adminOnly: true },
  { name: 'Configuración', to: '/settings', icon: Settings, adminOnly: true }
]

const navigation = computed(() => {
  return navigationItems.filter(item => {
    if (item.adminOnly) {
      return userStore.userRole === 'admin'
    }
    return true
  })
})

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

async function handleLogout() {
  const confirmed = await confirmAlert(
    'Cerrar Sesión',
    '¿Estás seguro de que deseas salir?'
  )
  
  if (!confirmed) return
  
  await userStore.logout()
  toast.success('Sesión cerrada correctamente', { duration: 2000 })
  router.push({ name: 'Login' })
}
</script>
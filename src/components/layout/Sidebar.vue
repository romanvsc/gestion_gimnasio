<template>
  <aside class="hidden md:flex md:flex-shrink-0 z-30">
    <div class="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div class="flex flex-col h-0 flex-1">
        <!-- Logo/Header -->
        <div class="flex items-center h-16 flex-shrink-0 px-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <img 
            v-if="settings.logo_url" 
            :src="settings.logo_url" 
            :alt="settings.nombre_gimnasio"
            class="h-8 w-auto object-contain"
          >
          <span v-else class="text-gray-900 dark:text-gray-100 text-lg font-bold tracking-tight">
            {{ settings.nombre_gimnasio }}
          </span>
        </div>

        <!-- Navigation -->
        <div class="flex-1 flex flex-col overflow-y-auto px-3 py-4">
          <nav class="flex-1 space-y-1">
            <template v-for="item in navigation" :key="item.name">
              <router-link
                :to="item.to"
                :class="[
                  isActive(item.to) 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out'
                ]"
              >
                <component 
                  :is="item.icon" 
                  :class="[
                    isActive(item.to) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300',
                    'flex-shrink-0 w-5 h-5 mr-3 transition-colors duration-150'
                  ]" 
                />
                {{ item.name }}
              </router-link>
            </template>
          </nav>
        </div>

        <!-- Theme toggle + User section -->
        <div class="flex-shrink-0 border-t border-gray-100 dark:border-gray-700">
          <!-- Theme Toggle -->
          <div class="px-4 pt-3 pb-1">
            <button
              @click="toggleTheme"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              <!-- Sun icon (shown in dark mode) -->
              <Sun v-if="isDark" class="w-5 h-5 text-amber-400" />
              <!-- Moon icon (shown in light mode) -->
              <Moon v-else class="w-5 h-5 text-gray-400" />
              <span>{{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}</span>
            </button>
          </div>

          <!-- User info -->
          <div class="p-4 pt-1">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
                  {{ userStore.userEmail.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="ml-3 min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{ userStore.userEmail }}</p>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-500 truncate">
                  {{ userStore.isAdmin ? 'Administrador' : 'Staff' }}
                </p>
              </div>
              <button
                @click="handleLogout"
                class="ml-2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Cerrar sesión"
              >
                <LogOut class="w-4 h-4" />
              </button>
            </div>
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
import { useTheme } from '@/composables/useTheme'
import { confirmAlert } from '@/lib/alerts'
import { LayoutDashboard, Users, CheckCircle, DollarSign, Wallet, Settings, BarChart3, LogOut, Moon, Sun } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { settings } = useSettings()
const { isDark, toggleTheme } = useTheme()

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
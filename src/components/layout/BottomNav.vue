<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
    <div class="flex justify-around items-center h-20 px-1">
      <!-- Items de navegación principales -->
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        :class="[
          isActive(item.to)
            ? 'text-primary-600 bg-primary-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          'flex flex-col items-center justify-center flex-1 h-full py-2 px-1 rounded-xl transition-all duration-200 min-w-0 touch-manipulation'
        ]"
      >
        <div :class="[
          isActive(item.to) ? 'scale-110' : '',
          'transition-transform duration-200'
        ]">
          <component :is="item.icon" class="w-6 h-6 mb-1" />
        </div>
        <span :class="[
          isActive(item.to) ? 'font-semibold' : 'font-medium',
          'text-xs truncate max-w-full'
        ]">{{ item.name }}</span>
        <div 
          v-if="isActive(item.to)" 
          class="absolute bottom-1 w-1 h-1 bg-primary-600 rounded-full"
        ></div>
      </router-link>

      <!-- Botón "Más" -->
      <button
        @click="showMoreMenu = !showMoreMenu"
        :class="[
          showMoreMenu || isMoreActive
            ? 'text-primary-600 bg-primary-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          'flex flex-col items-center justify-center flex-1 h-full py-2 px-1 rounded-xl transition-all duration-200 min-w-0 touch-manipulation'
        ]"
      >
        <div :class="[
          showMoreMenu ? 'scale-110' : '',
          'transition-transform duration-200'
        ]">
          <MoreIcon class="w-6 h-6 mb-1" />
        </div>
        <span :class="[
          showMoreMenu || isMoreActive ? 'font-semibold' : 'font-medium',
          'text-xs'
        ]">Más</span>
      </button>
    </div>

    <!-- Menú desplegable "Más" -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div 
        v-if="showMoreMenu" 
        class="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg rounded-t-2xl overflow-hidden"
      >
        <div class="p-4 space-y-1">
          <!-- Items del menú "Más" -->
          <router-link
            v-for="item in moreMenuItems"
            :key="item.name"
            :to="item.to"
            @click="showMoreMenu = false"
            :class="[
              isActive(item.to)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50',
              'flex items-center gap-4 px-4 py-3 rounded-xl transition-colors touch-manipulation'
            ]"
          >
            <component :is="item.icon" class="w-6 h-6" />
            <span class="font-medium">{{ item.name }}</span>
          </router-link>

          <!-- Separador -->
          <div class="border-t border-gray-200 my-2"></div>

          <!-- Cerrar Sesión -->
          <button
            @click="handleLogout"
            class="flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full touch-manipulation"
          >
            <LogoutIcon class="w-6 h-6" />
            <span class="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Overlay para cerrar el menú -->
    <div 
      v-if="showMoreMenu" 
      class="fixed inset-0 -z-10"
      @click="showMoreMenu = false"
    ></div>
  </nav>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuth } from '@/composables/useAuth'
import { confirmAlert } from '@/lib/alerts'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { logout } = useAuth()

const showMoreMenu = ref(false)

// Iconos SVG como componentes funcionales
const HomeIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'm2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' 
  })
])

const UsersIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' 
  })
])

const CheckIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' 
  })
])

const PaymentIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' 
  })
])

const CashIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z' 
  })
])

const MoreIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' 
  })
])

const StaffIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' 
  })
])

const SettingsIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z' 
  }),
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' 
  })
])

const ReportsIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' 
  })
])

const LogoutIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg', 
  fill: 'none', 
  viewBox: '0 0 24 24', 
  'stroke-width': '2', 
  stroke: 'currentColor' 
}, [
  h('path', { 
    'stroke-linecap': 'round', 
    'stroke-linejoin': 'round', 
    d: 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9' 
  })
])

// Navegación principal (5 items máximo para bottom nav)
const navigationItems = [
  { name: 'Inicio', to: '/', icon: HomeIcon },
  { name: 'Socios', to: '/miembros', icon: UsersIcon },
  { name: 'Check-In', to: '/checkin', icon: CheckIcon },
  { name: 'Pagos', to: '/pagos/nuevo', icon: PaymentIcon },
  { name: 'Caja', to: '/caja', icon: CashIcon, adminOnly: true }
]

// Items del menú "Más"
const moreMenuItemsList = [
  { name: 'Usuarios', to: '/staff', icon: StaffIcon, adminOnly: true },
  { name: 'Reportes', to: '/reports', icon: ReportsIcon, adminOnly: true },
  { name: 'Configuración', to: '/settings', icon: SettingsIcon, adminOnly: true }
]

const navigation = computed(() => {
  return navigationItems.filter(item => {
    if (item.adminOnly) {
      return userStore.userRole === 'admin'
    }
    return true
  })
})

const moreMenuItems = computed(() => {
  return moreMenuItemsList.filter(item => {
    if (item.adminOnly) {
      return userStore.userRole === 'admin'
    }
    return true
  })
})

// Verificar si algún item del menú "Más" está activo
const isMoreActive = computed(() => {
  return moreMenuItemsList.some(item => isActive(item.to))
})

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

async function handleLogout() {
  showMoreMenu.value = false
  
  const confirmed = await confirmAlert(
    'Cerrar Sesión',
    '¿Estás seguro de que deseas cerrar sesión?'
  )
  
  if (confirmed) {
    await logout()
    router.push({ name: 'Login' })
  }
}
</script>

<style scoped>
/* Soporte para safe area en dispositivos con notch */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* Mejora táctil */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Transición suave para el router-link */
nav a {
  position: relative;
  -webkit-user-select: none;
  user-select: none;
}

/* Efecto de presión */
nav a:active {
  transform: scale(0.95);
}
</style>
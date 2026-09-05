<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 border-t border-page-border bg-page-card/95 backdrop-blur md:hidden safe-area-bottom transition-colors duration-200"
    aria-label="Navegación principal"
  >
    <div class="relative z-20 flex h-20 items-center justify-around bg-page-card/95 px-1">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        :class="[
          isActive(item.to)
            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
            : 'text-page-subtitle hover:bg-page-card-hover hover:text-page-title',
          'relative flex h-full min-w-0 flex-1 touch-manipulation flex-col items-center justify-center rounded-xl px-1 py-2 transition-all duration-200'
        ]"
      >
        <div :class="[isActive(item.to) ? 'scale-110' : '', 'transition-transform duration-200']">
          <NavigationIcon :name="item.icon" class="mb-1 h-6 w-6" />
        </div>
        <span :class="[isActive(item.to) ? 'font-semibold' : 'font-medium', 'max-w-full truncate text-xs']">
          {{ item.name }}
        </span>
        <span
          v-if="isActive(item.to)"
          class="absolute bottom-1 h-1 w-1 rounded-full bg-primary-600"
          aria-hidden="true"
        />
      </router-link>

      <button
        type="button"
        @click="showMoreMenu = !showMoreMenu"
        :aria-expanded="showMoreMenu"
        aria-controls="mobile-more-menu"
        aria-haspopup="true"
        aria-label="Más opciones de navegación"
        :class="[
          showMoreMenu || isMoreActive
            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
            : 'text-page-subtitle hover:bg-page-card-hover hover:text-page-title',
          'relative flex h-full min-w-0 flex-1 touch-manipulation flex-col items-center justify-center rounded-xl px-1 py-2 transition-all duration-200'
        ]"
      >
        <Menu :class="[showMoreMenu ? 'scale-110' : '', 'mb-1 h-6 w-6 transition-transform duration-200']" aria-hidden="true" />
        <span :class="[showMoreMenu || isMoreActive ? 'font-semibold' : 'font-medium', 'text-xs']">Más</span>
      </button>
    </div>

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
        id="mobile-more-menu"
        aria-label="Más opciones"
        class="absolute bottom-full left-0 right-0 z-10 overflow-hidden rounded-t-xl border-t border-page-border bg-page-card shadow-lg"
        @keydown.esc="showMoreMenu = false"
      >
        <div class="space-y-1 p-4">
          <router-link
            v-for="item in moreMenuItems"
            :key="item.name"
            :to="item.to"
            @click="showMoreMenu = false"
            :class="[
              isActive(item.to)
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-page-subtitle hover:bg-page-card-hover hover:text-page-title',
              'flex touch-manipulation items-center gap-4 rounded-lg px-4 py-3 transition-colors'
            ]"
          >
            <NavigationIcon :name="item.icon" class="h-6 w-6" />
            <span class="font-medium">{{ item.name }}</span>
          </router-link>

          <div class="my-2 border-t border-page-border" />

          <button
            type="button"
            @click="handleLogout"
            class="flex w-full touch-manipulation items-center gap-4 rounded-lg px-4 py-3 text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/20"
          >
            <LogOut class="h-6 w-6" aria-hidden="true" />
            <span class="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </Transition>

    <div
      v-if="showMoreMenu"
      class="fixed inset-0 z-0 bg-black/40 backdrop-blur-[1px]"
      @click="showMoreMenu = false"
      aria-hidden="true"
    />
  </nav>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, LogOut } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { useAuth } from '@/composables/useAuth'
import { confirmAlert } from '@/lib/alerts'
import NavigationIcon from '@/components/ui/NavigationIcon.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { logout } = useAuth()
const showMoreMenu = ref(false)

const navigationItems = [
  { name: 'Inicio', to: '/', icon: 'dashboard' },
  { name: 'Socios', to: '/miembros', icon: 'members' },
  { name: 'Check-In', to: '/checkin', icon: 'check-in' },
  { name: 'Pagos', to: '/pagos/nuevo', icon: 'payments' },
  { name: 'Caja', to: '/caja', icon: 'cash', roles: ['admin', 'recepcion'] }
]

const moreMenuItemsList = [
  { name: 'Usuarios', to: '/staff', icon: 'staff', adminOnly: true },
  { name: 'Reportes', to: '/reports', icon: 'reports', adminOnly: true },
  { name: 'Configuración', to: '/settings', icon: 'settings', adminOnly: true }
]

function canSeeItem(item) {
  if (item.roles) return item.roles.includes(userStore.userRole)
  if (item.adminOnly) return userStore.userRole === 'admin'
  return true
}

const navigation = computed(() => navigationItems.filter(canSeeItem))
const moreMenuItems = computed(() => moreMenuItemsList.filter(canSeeItem))
const isMoreActive = computed(() => moreMenuItemsList.some(item => isActive(item.to)))

function isActive(path) {
  if (path === '/') return route.path === '/'
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
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

nav a {
  position: relative;
  -webkit-user-select: none;
  user-select: none;
}

nav a:active {
  transform: scale(0.95);
}
</style>

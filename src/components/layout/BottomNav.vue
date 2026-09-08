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
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <div :class="[isActive(item.to) ? 'scale-110' : '', 'transition-transform duration-200']">
          <NavigationIcon :name="item.icon" class="mb-1 h-8 w-8 object-contain" />
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
        aria-haspopup="dialog"
        :aria-label="showMoreMenu ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'"
        :class="[
          showMoreMenu || isMoreActive
            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
            : 'text-page-subtitle hover:bg-page-card-hover hover:text-page-title',
          'relative flex h-full min-w-0 flex-1 touch-manipulation flex-col items-center justify-center rounded-xl px-1 py-2 transition-all duration-200'
        ]"
      >
        <Menu :class="[showMoreMenu ? 'scale-110' : '', 'mb-1 h-6 w-6 transition-transform duration-200']" aria-hidden="true" />
        <span :class="[showMoreMenu || isMoreActive ? 'font-semibold' : 'font-medium', 'text-xs']">Menú</span>
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
        ref="menuPanelRef"
        id="mobile-more-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        tabindex="-1"
        class="absolute bottom-full left-0 right-0 z-10 max-h-[70dvh] overflow-y-auto rounded-t-2xl border-t border-page-border bg-page-card shadow-lg"
      >
        <div class="flex items-center justify-between border-b border-page-border px-4 py-3">
          <h2 id="mobile-menu-title" class="text-base font-semibold text-page-title">Menú de navegación</h2>
          <button
            ref="menuCloseButtonRef"
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-lg text-page-subtitle transition-colors hover:bg-page-card-hover hover:text-page-title"
            aria-label="Cerrar menú de navegación"
            @click="closeMenu"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div class="space-y-1 p-4">
          <router-link
            v-for="item in moreMenuItems"
            :key="item.name"
            :to="item.to"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            @click="closeMenu"
            :class="[
              isActive(item.to)
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-page-subtitle hover:bg-page-card-hover hover:text-page-title',
              'flex touch-manipulation items-center gap-4 rounded-lg px-4 py-3 transition-colors'
            ]"
          >
            <NavigationIcon :name="item.icon" class="h-8 w-8 flex-shrink-0 object-contain" />
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
      @click="closeMenu"
      aria-hidden="true"
    />
  </nav>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, LogOut, X } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { useAuth } from '@/composables/useAuth'
import { confirmAlert } from '@/lib/alerts'
import NavigationIcon from '@/components/ui/NavigationIcon.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { logout } = useAuth()
const showMoreMenu = ref(false)
const menuPanelRef = ref(null)
const menuCloseButtonRef = ref(null)
let previouslyFocusedElement = null
let previousBodyOverflow = ''

const navigationItems = [
  { name: 'Inicio', to: '/', icon: 'dashboard' },
  { name: 'Socios', to: '/miembros', icon: 'members' },
  { name: 'Control de acceso', to: '/checkin', icon: 'check-in' },
  { name: 'Pagos', to: '/pagos/nuevo', icon: 'payments' },
  { name: 'Caja', to: '/caja', icon: 'cash', roles: ['admin', 'recepcion'] }
]

const moreMenuItemsList = [
  { name: 'Equipo', to: '/staff', icon: 'staff', adminOnly: true },
  { name: 'Reportes', to: '/reports', icon: 'reports', adminOnly: true },
  { name: 'Configuración', to: '/settings', icon: 'settings', adminOnly: true },
  { name: 'Banco de horas', to: '/banco-horas', icon: 'work-hours', roles: ['admin', 'recepcion'] }
]

function canSeeItem(item) {
  if (item.roles) return item.roles.includes(userStore.userRole)
  if (item.adminOnly) return userStore.userRole === 'admin'
  return true
}

const navigation = computed(() => navigationItems.filter(canSeeItem))
const moreMenuItems = computed(() => moreMenuItemsList.filter(canSeeItem))
const isMoreActive = computed(() => moreMenuItemsList.some(item => isActive(item.to)))

function getFocusableElements() {
  if (!menuPanelRef.value) return []

  return [...menuPanelRef.value.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter(element => element.offsetParent !== null)
}

function closeMenu() {
  showMoreMenu.value = false
}

function handleMenuKeydown(event) {
  if (!showMoreMenu.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu()
    return
  }

  if (event.key !== 'Tab') return

  const focusableElements = getFocusableElements()
  if (focusableElements.length === 0) {
    event.preventDefault()
    menuPanelRef.value?.focus()
    return
  }

  const first = focusableElements[0]
  const last = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(showMoreMenu, async (isOpen) => {
  if (isOpen) {
    previouslyFocusedElement = document.activeElement
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    ;(menuCloseButtonRef.value || getFocusableElements()[0] || menuPanelRef.value)?.focus()
    return
  }

  document.body.style.overflow = previousBodyOverflow
  if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus()
  previouslyFocusedElement = null
})

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

async function handleLogout() {
  closeMenu()
  const confirmed = await confirmAlert(
    'Cerrar sesión',
    '¿Querés cerrar la sesión?'
  )

  if (confirmed) {
    await logout()
    router.push({ name: 'Login' })
  }
}

onMounted(() => document.addEventListener('keydown', handleMenuKeydown))

onUnmounted(() => {
  document.removeEventListener('keydown', handleMenuKeydown)
  document.body.style.overflow = previousBodyOverflow
})
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

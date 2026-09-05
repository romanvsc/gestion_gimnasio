<template>
  <!-- Navegación compacta para tablet y navegador angosto -->
  <aside class="z-30 hidden flex-shrink-0 md:flex xl:hidden" aria-label="Navegación compacta">
    <div class="flex h-full w-20 flex-col bg-secondary-950 text-neutral-300 transition-colors duration-200">
      <div class="flex h-16 flex-shrink-0 items-center justify-center border-b border-white/10">
        <GymLogo
          :src="settings.logo_url"
          :alt="settings.nombre_gimnasio"
          class="h-10 w-10 rounded-xl bg-white p-1 object-contain"
        />
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegación de la aplicación">
        <div
          v-for="section in navigationSections"
          :key="`compact-${section.label}`"
          class="space-y-1 first:mt-0"
          :class="section.label === 'Administración' ? 'mt-5 border-t border-white/10 pt-4' : ''"
        >
          <router-link
            v-for="item in section.items"
            :key="`compact-${item.name}`"
            :to="item.to"
            :aria-label="item.name"
            :title="item.name"
            :class="[
              isActive(item.to)
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-neutral-400 hover:bg-white/10 hover:text-white',
              'group flex h-11 w-full items-center justify-center rounded-lg transition-colors'
            ]"
          >
            <NavigationIcon :name="item.icon" class="h-5 w-5" />
          </router-link>
        </div>
      </nav>

      <div class="space-y-2 border-t border-white/10 p-3">
        <button
          type="button"
          @click="toggleTheme"
          :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          class="flex h-11 w-full items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Sun v-if="isDark" class="h-5 w-5 text-warning-400" aria-hidden="true" />
          <Moon v-else class="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          @click="handleLogout"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          class="flex h-11 w-full items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-danger-900/40 hover:text-danger-300"
        >
          <LogOut class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </aside>

  <!-- Sidebar completo para desktop -->
  <aside class="z-30 hidden flex-shrink-0 xl:flex" aria-label="Navegación principal">
    <div class="flex w-64 flex-col bg-secondary-950 text-neutral-300 transition-colors duration-200">
      <div class="flex h-full min-h-0 flex-col">
        <div class="flex min-h-20 flex-shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <GymLogo
            :src="settings.logo_url"
            :alt="settings.nombre_gimnasio"
            class="h-11 w-11 rounded-xl bg-white p-1 object-contain"
          />
          <div class="min-w-0">
            <p class="truncate text-sm font-bold tracking-wide text-white">{{ settings.nombre_gimnasio || 'Yacyretá' }}</p>
            <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Gestión deportiva</p>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegación de la aplicación">
          <div
            v-for="section in navigationSections"
            :key="section.label"
            :class="section.label === 'Administración' ? 'mt-5 border-t border-white/10 pt-4' : ''"
          >
            <p class="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {{ section.label }}
            </p>
            <div class="space-y-1">
              <router-link
                v-for="item in section.items"
                :key="item.name"
                :to="item.to"
                :class="[
                  isActive(item.to)
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white',
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ease-in-out'
                ]"
              >
                <NavigationIcon :name="item.icon" class="mr-3 h-5 w-5 flex-shrink-0" />
                {{ item.name }}
              </router-link>
            </div>
          </div>
        </nav>

        <div class="flex-shrink-0 border-t border-white/10">
          <div class="px-4 pt-3 pb-1">
            <button
              type="button"
              @click="toggleTheme"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              <Sun v-if="isDark" class="h-5 w-5 text-warning-400" aria-hidden="true" />
              <Moon v-else class="h-5 w-5 text-neutral-500" aria-hidden="true" />
              <span>{{ isDark ? 'Modo claro' : 'Modo oscuro' }}</span>
            </button>
          </div>

          <div class="flex items-center justify-end px-4 py-3">
            <button
              type="button"
              @click="handleLogout"
              class="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-danger-900/40 hover:text-danger-300"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut class="h-4 w-4" aria-hidden="true" />
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
import { useTheme } from '@/composables/useTheme'
import { confirmAlert } from '@/lib/alerts'
import GymLogo from '@/components/brand/GymLogo.vue'
import NavigationIcon from '@/components/ui/NavigationIcon.vue'
import { LogOut, Moon, Sun } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { settings } = useSettings()
const { isDark, toggleTheme } = useTheme()

const navigationItems = [
  { name: 'Dashboard', to: '/', icon: 'dashboard', section: 'Operación' },
  { name: 'Socios', to: '/miembros', icon: 'members', section: 'Operación' },
  { name: 'Check-In', to: '/checkin', icon: 'check-in', section: 'Operación' },
  { name: 'Pagos', to: '/pagos/nuevo', icon: 'payments', section: 'Operación' },
  { name: 'Reportes', to: '/reports', icon: 'reports', section: 'Operación', adminOnly: true },
  { name: 'Caja', to: '/caja', icon: 'cash', section: 'Administración', roles: ['admin', 'recepcion'] },
  { name: 'Usuarios', to: '/staff', icon: 'staff', section: 'Administración', adminOnly: true },
  { name: 'Configuración', to: '/settings', icon: 'settings', section: 'Administración', adminOnly: true }
]

const visibleNavigation = computed(() => navigationItems.filter(item => {
  if (item.roles) return item.roles.includes(userStore.userRole)
  if (item.adminOnly) return userStore.userRole === 'admin'
  return true
}))

const navigationSections = computed(() => ['Operación', 'Administración']
  .map(label => ({
    label,
    items: visibleNavigation.value.filter(item => item.section === label)
  }))
  .filter(section => section.items.length > 0))

function isActive(path) {
  if (path === '/') return route.path === '/'
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

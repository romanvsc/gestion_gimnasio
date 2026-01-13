<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
    <div class="flex justify-around items-center h-16">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        :class="[
          isActive(item.to)
            ? 'text-primary-600'
            : 'text-gray-500',
          'flex flex-col items-center justify-center flex-1 h-full transition-colors'
        ]"
      >
        <span class="text-sm font-medium">{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const userStore = useUserStore()

const navigationItems = [
  { name: 'Inicio', to: '/' },
  { name: 'Socios', to: '/miembros' },
  { name: 'Check-In', to: '/checkin' },
  { name: 'Pagos', to: '/pagos/nuevo' },
  { name: 'Caja', to: '/caja', adminOnly: true },
  { name: 'Usuarios', to: '/staff', adminOnly: true }
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
</script>
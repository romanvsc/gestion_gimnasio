<template>
  <div class="flex h-screen overflow-hidden bg-page-bg transition-colors duration-200">
    <!-- Sidebar para desktop -->
    <Sidebar />

    <!-- Contenido principal -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <!-- Main content -->
      <main class="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
        <router-view :key="activeViewKey" />
      </main>

      <!-- Bottom navigation para mobile -->
      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import Sidebar from './Sidebar.vue'
import BottomNav from './BottomNav.vue'

const userStore = useUserStore()
const activeViewKey = ref(0)

const RESUME_DEBOUNCE_MS = 350
const RESUME_COOLDOWN_MS = 1200
const HEARTBEAT_INTERVAL_MS = 1000
const HEARTBEAT_GAP_MS = 4500

let resumeTimer = null
let heartbeatTimer = null
let lastRefreshAt = Date.now()
let lastHeartbeatAt = Date.now()

function refreshActiveView() {
  const now = Date.now()
  if (now - lastRefreshAt < RESUME_COOLDOWN_MS) return

  lastRefreshAt = now
  // Incrementar la key fuerza el re-mount de la vista activa (dispara onMounted)
  activeViewKey.value += 1
  // Ademas actualizamos el store reactivo para los watchers de useAppResume
  userStore.triggerResume()
}

function scheduleRefresh() {
  if (resumeTimer) clearTimeout(resumeTimer)
  resumeTimer = setTimeout(refreshActiveView, RESUME_DEBOUNCE_MS)
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') scheduleRefresh()
}

function handleWindowFocus() {
  scheduleRefresh()
}

function handlePageShow() {
  scheduleRefresh()
}

function handleHeartbeatTick() {
  const now = Date.now()
  const gap = now - lastHeartbeatAt
  lastHeartbeatAt = now

  if (document.visibilityState !== 'visible') return
  if (gap < HEARTBEAT_GAP_MS) return

  scheduleRefresh()
}

onMounted(() => {
  lastHeartbeatAt = Date.now()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)
  window.addEventListener('pageshow', handlePageShow)
  heartbeatTimer = setInterval(handleHeartbeatTick, HEARTBEAT_INTERVAL_MS)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
  window.removeEventListener('pageshow', handlePageShow)
  if (resumeTimer) clearTimeout(resumeTimer)
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
})
</script>
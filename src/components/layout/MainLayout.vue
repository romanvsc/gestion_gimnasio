<template>
  <div class="flex h-[100dvh] overflow-hidden bg-page-bg transition-colors duration-200">
    <!-- Sidebar para desktop -->
    <Sidebar />

    <!-- Contenido principal -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <a
        href="#main-content"
        class="skip-link"
      >
        Ir al contenido principal
      </a>
      <!-- Main content -->
      <main id="main-content" class="flex-1 relative overflow-y-auto focus:outline-none mobile-main-content" tabindex="-1">
        <router-view :key="activeViewKey" />
      </main>

      <!-- Bottom navigation para mobile -->
      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import Sidebar from './Sidebar.vue'
import BottomNav from './BottomNav.vue'

const userStore = useUserStore()
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
  // Las vistas actualizan sus datos mediante useAppResume sin desmontar formularios.
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

<style scoped>
.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 100;
  transform: translateY(-150%);
  border-radius: 0.75rem;
  background: #171717;
  color: #fff7ed;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 10px 25px rgb(0 0 0 / 25%);
  transition: transform 150ms ease;
}

.skip-link:focus {
  transform: translateY(0);
}
</style>

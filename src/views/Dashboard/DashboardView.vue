<template>
  <div class="bg-page-bg min-h-screen transition-colors duration-200">
    <div class="mx-auto max-w-[1440px] px-4 py-4 md:px-6 md:py-6 xl:px-8">
      <TopBar title="Dashboard" :subtitle="dashboardDate">
        <template #actions>
          <div class="hidden items-center gap-3 lg:flex">
            <div class="flex h-10 items-center gap-2 rounded-lg border border-page-border bg-page-card px-3 text-sm text-page-muted">
              <Search class="h-4 w-4" aria-hidden="true" />
              <span>Buscar socio...</span>
            </div>
            <div class="relative">
              <button
                type="button"
                class="relative flex h-10 w-10 items-center justify-center rounded-lg border border-page-border bg-page-card text-page-subtitle transition-colors hover:bg-page-card-hover hover:text-page-title focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Notificaciones"
                aria-label="Notificaciones"
                :aria-expanded="showNotifications"
                aria-controls="dashboard-notifications"
                @click="showNotifications = !showNotifications"
                @keydown.esc="showNotifications = false"
              >
              <Bell class="h-4 w-4" aria-hidden="true" />
                <span
                  v-if="stats.expiredMembers > 0"
                  class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-bold text-white"
                >
                  {{ stats.expiredMembers > 99 ? '99+' : stats.expiredMembers }}
                </span>
              </button>

              <div
                v-if="showNotifications"
                id="dashboard-notifications"
                role="dialog"
                aria-label="Notificaciones pendientes"
                class="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-xl border border-page-border bg-page-card shadow-xl"
              >
                <div class="border-b border-page-border px-4 py-3">
                  <p class="text-sm font-semibold text-page-title">Notificaciones</p>
                  <p class="mt-0.5 text-xs text-page-subtitle">Pendientes de atención</p>
                </div>

                <button
                  type="button"
                  v-if="stats.expiredMembers > 0"
                  class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-page-card-hover"
                  @click="openExpiredMembers"
                >
                  <span class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300">
                    <AlertCircle class="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span class="min-w-0">
                    <span class="block text-sm font-semibold text-page-title">Cuotas vencidas</span>
                    <span class="mt-0.5 block text-xs text-page-subtitle">{{ stats.expiredMembers }} socios necesitan regularizar su cuota.</span>
                    <span class="mt-2 block text-xs font-semibold text-primary-600 dark:text-primary-400">Ver socios vencidos</span>
                  </span>
                </button>

                <p v-else class="px-4 py-5 text-sm text-page-subtitle">No hay notificaciones pendientes.</p>
              </div>
            </div>
          </div>
          <div class="flex min-w-0 items-center gap-2.5">
            <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
              {{ userInitial }}
            </div>
            <div class="hidden min-w-0 sm:block">
              <p class="max-w-40 truncate text-sm font-semibold text-page-title">{{ userStore.userEmail }}</p>
              <p class="text-xs text-page-subtitle">{{ roleLabel }}</p>
            </div>
          </div>
        </template>
      </TopBar>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-5">
        <!-- Skeleton para Tarjetas de Métricas -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div v-for="i in 4" :key="i" class="rounded-lg border border-page-border bg-page-card p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1 space-y-3">
                <BaseSkeleton width="60%" height="0.875rem" />
                <BaseSkeleton width="50%" height="2rem" />
              </div>
              <BaseSkeleton width="48px" height="48px" rounded="lg" />
            </div>
          </div>
        </div>
        
        <!-- Skeleton para Tabla de Check-ins -->
        <div class="rounded-lg border border-page-border bg-page-card p-4 md:p-5">
          <BaseSkeleton width="180px" height="1.5rem" class="mb-6" />
          <div class="space-y-4">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 py-3">
              <BaseSkeleton width="40%" height="1rem" />
              <BaseSkeleton width="20%" height="1rem" />
              <BaseSkeleton width="15%" height="1rem" />
              <BaseSkeleton width="60px" height="24px" rounded="full" />
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Tarjetas de Métricas -->
        <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Recaudación"
            :value="formatCurrencyFull(stats.monthlyRevenue)"
            :icon="Wallet"
            icon-bg-color="bg-primary-50"
            icon-color="text-primary-600"
            badge="Mensual"
          />
          
          <StatCard
            title="Socios Activos"
            :value="stats.activeMembers"
            :icon="Users"
            route="/miembros"
            icon-bg-color="bg-info-50"
            icon-color="text-info-600"
          />
          
          <StatCard
            title="Asistencia Hoy"
            :value="stats.todayAttendance"
            :icon="Activity"
            route="/checkin"
            icon-bg-color="bg-success-50"
            icon-color="text-success-600"
            badge="En vivo"
            badge-variant="live"
          />
          
          <StatCard
            title="Cuotas Vencidas"
            :value="stats.expiredMembers"
            :icon="AlertCircle"
            route="/miembros"
            icon-bg-color="bg-danger-50"
            icon-color="text-danger-600"
            :badge="stats.expiredMembers > 0 ? 'Revisar' : ''"
            badge-variant="urgent"
          />
        </div>

        <!-- Acciones Rápidas -->
        <section class="mb-6">
          <!-- Acciones Rápidas -->
          <h2 class="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-page-muted">Acciones rápidas</h2>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DashboardActionCard
                title="Nuevo Socio"
                subtitle="Registrar nueva alta"
                :icon="UserPlus"
                featured
                icon-bg-class="bg-primary-50"
                icon-text-class="text-primary-600"
                hover-border-class="hover:border-primary-300"
                title-hover-class="group-hover:text-primary-700"
                @click="router.push({ name: 'NewMember' })"
              />
              <DashboardActionCard
                title="Registrar Pago"
                subtitle="Ingresar cuota"
                :icon="BadgeDollarSign"
                icon-bg-class="bg-success-50"
                icon-text-class="text-success-600"
                hover-border-class="hover:border-success-300"
                title-hover-class="group-hover:text-success-700"
                @click="router.push({ name: 'NewPayment' })"
              />
              <DashboardActionCard
                title="Check-In"
                subtitle="Control de acceso"
                :icon="CheckCircle"
                icon-bg-class="bg-info-50"
                icon-text-class="text-info-600"
                hover-border-class="hover:border-info-300"
                title-hover-class="group-hover:text-info-700"
                @click="router.push({ name: 'CheckIn' })"
              />
          </div>
        </section>

        <!-- Asistencia y prioridad operativa -->
        <section class="mb-6 grid gap-4 xl:grid-cols-3">
          <div class="h-full rounded-lg border border-page-border bg-page-card p-4 md:p-5 xl:col-span-2">
            <AssistanceChart />
          </div>

          <aside
            class="flex h-full flex-col rounded-lg border p-4 md:p-5"
            :class="stats.expiredMembers > 0
              ? 'border-danger-200 bg-danger-50/70 dark:border-danger-800 dark:bg-danger-950/30'
              : 'border-page-border bg-page-card'"
            aria-labelledby="expired-members-title"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-page-muted">Atención prioritaria</p>
                <h2
                  id="expired-members-title"
                  class="mt-1 text-base font-bold tracking-tight"
                  :class="stats.expiredMembers > 0 ? 'text-danger-900 dark:text-danger-100' : 'text-page-title'"
                >
                  Cuotas vencidas
                </h2>
              </div>
              <div
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                :class="stats.expiredMembers > 0
                  ? 'bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300'
                  : 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-300'"
              >
                <AlertCircle v-if="stats.expiredMembers > 0" class="h-4 w-4" aria-hidden="true" />
                <CheckCircle v-else class="h-4 w-4" aria-hidden="true" />
              </div>
            </div>

            <p
              class="mt-6 text-3xl font-extrabold tracking-tight"
              :class="stats.expiredMembers > 0 ? 'text-danger-950 dark:text-danger-50' : 'text-page-title'"
            >
              {{ stats.expiredMembers }}
            </p>
            <p class="mt-1 text-sm" :class="stats.expiredMembers > 0 ? 'text-danger-800/80 dark:text-danger-200/80' : 'text-page-subtitle'">
              {{ stats.expiredMembers > 0 ? 'socios necesitan regularizar su cuota.' : 'No hay cuotas vencidas para revisar.' }}
            </p>
            <p v-if="statsUpdatedAt" class="mt-2 text-xs text-page-muted">
              Actualizado: {{ formatDateTime(statsUpdatedAt) }}
            </p>

            <BaseButton
              :variant="stats.expiredMembers > 0 ? 'danger' : 'secondary'"
              size="sm"
              class="mt-auto w-full !font-semibold"
              @click="router.push({ name: 'Members', query: { filter: 'vencidos' } })"
            >
              Gestionar vencidos
            </BaseButton>
          </aside>
        </section>

        <!-- Últimos Check-Ins -->
        <section class="overflow-hidden rounded-lg border border-page-border bg-page-card">
          <div class="flex items-center justify-between border-b border-page-border px-4 py-3.5 md:px-5">
            <div>
              <h2 class="text-base font-bold text-page-title">Últimos accesos</h2>
              <p class="mt-0.5 text-xs text-page-subtitle">Actividad reciente del gimnasio</p>
            </div>
            <BaseButton
              variant="ghost"
              @click="showLastAccessModal = true"
              size="sm"
              class="!text-xs !font-semibold"
            >
              Ver todos
            </BaseButton>
          </div>

          <!-- Loading de check-ins -->
          <div v-if="loadingCheckIns" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full table-fixed">
              <thead>
                <tr class="border-b border-page-border bg-page-bg/60">
                  <th class="w-[48%] px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-page-muted md:w-auto md:px-5">Socio</th>
                  <th class="hidden px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-page-muted sm:table-cell md:px-5">DNI</th>
                  <th class="w-[25%] px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-page-muted md:w-auto md:px-5">Hora</th>
                  <th class="w-[27%] px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-page-muted md:w-auto md:px-5">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="checkin in recentCheckIns" 
                  :key="checkin.id"
                  class="border-b border-page-border last:border-0 transition-colors hover:bg-page-card-hover"
                >
                  <td class="px-4 py-2.5 text-sm font-semibold text-page-title md:px-5">
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      class="w-full justify-start px-0 py-0 hover:bg-transparent focus:ring-0 !font-semibold"
                      @click="goToMember(checkin.memberId)"
                    >
                      <span class="flex flex-col items-start">
                        <span>{{ checkin.name }}</span>
                        <span class="mt-0.5 text-xs font-normal text-page-muted sm:hidden">DNI {{ checkin.dni }}</span>
                      </span>
                    </BaseButton>
                  </td>
                  <td class="hidden px-4 py-2.5 font-mono text-xs text-page-subtitle sm:table-cell md:px-5">{{ checkin.dni }}</td>
                  <td class="whitespace-nowrap px-4 py-2.5 text-xs text-page-subtitle md:px-5">{{ checkin.time }}</td>
                  <td class="px-4 py-2.5 md:px-5">
                    <StatusBadge
                      :status="checkin.status"
                      :label="checkin.statusLabel"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="recentCheckIns.length === 0" class="py-8 text-center text-sm text-page-muted">
              No hay check-ins recientes
            </div>
          </div>
        </section>

      </div>
    </div>

    <!-- Modal de Últimos Accesos -->
    <LastAccessModal
      v-if="showLastAccessModal"
      @close="showLastAccessModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useGymStore } from '@/stores/gymStore'
import { useAppResume } from '@/composables/useAppResume'
import { errorAlert } from '@/lib/alerts'
import { reportClientError } from '@/lib/observability'
import { formatCurrencyFull, formatDateTime } from '@/utils/formatters'
import { useAttendance } from '@/composables/useAttendance'
import { Wallet, Users, Activity, AlertCircle, UserPlus, BadgeDollarSign, CheckCircle, Search, Bell } from 'lucide-vue-next'
import StatCard from '@/components/dashboard/StatCard.vue'
import DashboardActionCard from '@/components/dashboard/DashboardActionCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LastAccessModal from '@/components/modals/LastAccessModal.vue'
import AssistanceChart from '@/components/charts/AssistanceChart.vue'
import TopBar from '@/components/layout/TopBar.vue'

const router = useRouter()
const userStore = useUserStore()
const gymStore = useGymStore()

const dashboardDate = computed(() => {
  const value = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date())

  return value.charAt(0).toUpperCase() + value.slice(1)
})

const userInitial = computed(() => (userStore.userEmail || 'U').charAt(0).toUpperCase())
const roleLabel = computed(() => ({
  admin: 'Administrador',
  recepcion: 'Recepción',
  staff: 'Staff'
}[userStore.userRole] || 'Usuario'))

const loading = ref(false)
const showLastAccessModal = ref(false)
const showNotifications = ref(false)
const statsUpdatedAt = ref(null)
const stats = ref({
  totalMembers: 0,
  activeMembers: 0,
  expiredMembers: 0,
  todayAttendance: 0,
  monthlyRevenue: 0
})

const {
  recentCheckIns,
  loadingRecent: loadingCheckIns,
  loadRecentCheckIns,
  subscribeToAttendanceInserts,
  unsubscribe
} = useAttendance({ recentLimit: 5 })

let unsubscribeRealtime = null
let statsRefreshTimer = null

async function loadStats() {
  loading.value = true
  try {
    await gymStore.getStats()
    stats.value = gymStore.stats
    statsUpdatedAt.value = new Date()
  } catch (err) {
    reportClientError('dashboard.stats_fetch', err)
    errorAlert('Error', 'No se pudieron cargar las estadísticas')
  } finally {
    loading.value = false
  }
}

function scheduleStatsRefresh() {
  if (statsRefreshTimer) clearTimeout(statsRefreshTimer)
  statsRefreshTimer = setTimeout(() => {
    loadStats()
  }, 800)
}

function goToMember(memberId) {
  if (memberId) {
    router.push({ name: 'MemberDetail', params: { id: memberId } })
  }
}

function openExpiredMembers() {
  showNotifications.value = false
  router.push({ name: 'Members', query: { filter: 'vencidos' } })
}

async function refreshDashboardData() {
  await Promise.all([
    loadStats(),
    loadRecentCheckIns()
  ])
}

onMounted(async () => {
  await refreshDashboardData()

  unsubscribeRealtime = subscribeToAttendanceInserts({
    channelName: 'dashboard-attendance',
    onInsert: scheduleStatsRefresh,
    limit: 5
  })
})

useAppResume(async () => {
  await refreshDashboardData()
}, { minIntervalMs: 1500, showToast: true })

onUnmounted(() => {
  if (statsRefreshTimer) clearTimeout(statsRefreshTimer)
  if (typeof unsubscribeRealtime === 'function') unsubscribeRealtime()
  unsubscribe()
})
</script>

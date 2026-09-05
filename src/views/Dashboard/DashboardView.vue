<template>
  <div class="bg-page-bg min-h-screen transition-colors duration-200">
    <div class="max-w-[1440px] mx-auto px-4 py-6 md:px-6 md:py-8 xl:px-8">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-page-title leading-tight mb-3">
          Bienvenido de nuevo, <span class="text-primary-500">{{ settings.nombre_gimnasio }}</span>
        </h1>
        <p class="text-page-subtitle text-base md:text-lg">
          Tu centro de alto rendimiento está operando al máximo nivel hoy.
          <span v-if="userStore.isAdmin" class="ml-2 inline-flex items-center px-2.5 py-0.5 bg-yellow-400/10 text-yellow-400 text-xs font-bold rounded-md border border-yellow-400/20 uppercase tracking-wider">
            Administrador
          </span>
          <span v-else-if="userStore.isStaff" class="ml-2 inline-flex items-center px-2.5 py-0.5 bg-secondary-400/10 text-secondary-400 text-xs font-bold rounded-md border border-secondary-400/20 uppercase tracking-wider">
            Personal
          </span>
        </p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-8">
        <!-- Skeleton para Tarjetas de Métricas -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div v-for="i in 4" :key="i" class="bg-page-card rounded-xl shadow-sm border border-page-border p-6">
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
        <div class="bg-page-card rounded-xl shadow-sm border border-page-border p-6">
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
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
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
            icon-bg-color="bg-secondary-50"
            icon-color="text-secondary-600"
          />
          
          <StatCard
            title="Asistencia Hoy"
            :value="stats.todayAttendance"
            :icon="Activity"
            route="/checkin"
            icon-bg-color="bg-primary-50"
            icon-color="text-primary-600"
            badge="En vivo"
            badge-variant="live"
          />
          
          <StatCard
            title="Cuotas Vencidas"
            :value="stats.expiredMembers"
            :icon="AlertCircle"
            route="/miembros"
            icon-bg-color="bg-red-50"
            icon-color="text-red-600"
            :badge="stats.expiredMembers > 0 ? 'Revisar' : ''"
            badge-variant="urgent"
          />
        </div>

        <!-- Acciones Rápidas + Gráfico -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <!-- Acciones Rápidas -->
          <div>
            <h2 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Acciones Rápidas</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2.5">
              <DashboardActionCard
                title="Nuevo Socio"
                subtitle="Registrar nueva alta"
                :icon="UserPlus"
                icon-bg-class="bg-primary-50"
                icon-text-class="text-primary-600"
                hover-border-class="hover:border-primary-100"
                title-hover-class="group-hover:text-primary-700"
                @click="router.push({ name: 'NewMember' })"
              />
              <DashboardActionCard
                title="Registrar Pago"
                subtitle="Ingresar cuota"
                :icon="BadgeDollarSign"
                icon-bg-class="bg-emerald-50"
                icon-text-class="text-emerald-600"
                hover-border-class="hover:border-emerald-100"
                title-hover-class="group-hover:text-emerald-700"
                @click="router.push({ name: 'NewPayment' })"
              />
              <DashboardActionCard
                title="Check-In"
                subtitle="Control de acceso"
                :icon="CheckCircle"
                icon-bg-class="bg-primary-50"
                icon-text-class="text-primary-600"
                hover-border-class="hover:border-primary-100"
                title-hover-class="group-hover:text-primary-700"
                @click="router.push({ name: 'CheckIn' })"
              />
              <DashboardActionCard
                title="Últimos Accesos"
                subtitle="Historial reciente"
                :icon="ListChecks"
                icon-bg-class="bg-secondary-50"
                icon-text-class="text-secondary-600"
                hover-border-class="hover:border-secondary-100"
                title-hover-class="group-hover:text-secondary-700"
                @click="showLastAccessModal = true"
              />
            </div>
          </div>

          <!-- Gráfico de Asistencia -->
          <div class="bg-page-card rounded-xl border border-page-border p-5 md:p-6">
            <AssistanceChart />
          </div>
        </div>

        <!-- Tarjeta de Alerta: Socios Vencidos -->
        <div v-if="stats.expiredMembers > 0" class="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-900 dark:via-primary-800 dark:to-primary-700 rounded-2xl p-6 md:p-8 mb-8">
          <!-- Subtle pattern overlay -->
          <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%);"></div>
          <div class="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 class="text-xl md:text-2xl font-extrabold text-white mb-1.5 tracking-tight">
                {{ stats.expiredMembers }} Socios con Cuota Vencida
              </h3>
              <p v-if="statsUpdatedAt" class="mb-1 text-xs text-primary-100/70">
                Actualizado: {{ formatDateTime(statsUpdatedAt) }}
              </p>
              <p class="text-sm md:text-base text-primary-100/80">
                Se requiere acción inmediata para regularizar el acceso a las instalaciones.
              </p>
            </div>
            <BaseButton
              variant="secondary"
              size="lg"
              @click="router.push({ name: 'Members', query: { filter: 'vencidos' } })"
              class="flex-shrink-0 !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !font-bold uppercase tracking-wider"
            >
              Gestionar Morosos
            </BaseButton>
          </div>
        </div>

        <!-- Últimos Check-Ins -->
        <div class="bg-page-card rounded-xl border border-page-border overflow-hidden">
          <div class="flex items-center justify-between px-6 py-5 border-b border-page-border">
            <h2 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Últimos Accesos</h2>
            <BaseButton
              variant="ghost"
              @click="showLastAccessModal = true"
              size="sm"
              class="!text-xs !uppercase !tracking-wider !font-bold"
            >
              Ver todos
            </BaseButton>
          </div>

          <!-- Loading de check-ins -->
          <div v-if="loadingCheckIns" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-page-border">
                  <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Socio</th>
                  <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">DNI</th>
                  <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Hora</th>
                  <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="checkin in recentCheckIns" 
                  :key="checkin.id"
                  class="border-b border-page-border last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td class="py-4 px-6 text-sm font-semibold text-page-title">
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      class="w-full justify-start px-0 py-0 hover:bg-transparent focus:ring-0 !font-semibold"
                      @click="goToMember(checkin.memberId)"
                    >
                      {{ checkin.name }}
                    </BaseButton>
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 font-mono">{{ checkin.dni }}</td>
                  <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{{ checkin.time }}</td>
                  <td class="py-4 px-6">
                    <StatusBadge
                      :status="checkin.status"
                      :label="checkin.statusLabel"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="recentCheckIns.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500">
              No hay check-ins recientes
            </div>
          </div>
        </div>

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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useGymStore } from '@/stores/gymStore'
import { useSettings } from '@/composables/useSettings'
import { useAppResume } from '@/composables/useAppResume'
import { errorAlert } from '@/lib/alerts'
import { reportClientError } from '@/lib/observability'
import { formatCurrencyFull, formatDateTime } from '@/utils/formatters'
import { useAttendance } from '@/composables/useAttendance'
import { Wallet, Users, Activity, AlertCircle, UserPlus, BadgeDollarSign, CheckCircle, ListChecks } from 'lucide-vue-next'
import StatCard from '@/components/dashboard/StatCard.vue'
import DashboardActionCard from '@/components/dashboard/DashboardActionCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LastAccessModal from '@/components/modals/LastAccessModal.vue'
import AssistanceChart from '@/components/charts/AssistanceChart.vue'

const router = useRouter()
const userStore = useUserStore()
const gymStore = useGymStore()
const { settings } = useSettings()

const loading = ref(false)
const showLastAccessModal = ref(false)
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

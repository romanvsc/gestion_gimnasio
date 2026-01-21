<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">Dashboard</h1>
        <p class="text-page-subtitle mb-6">
          Bienvenido de nuevo, {{ settings.nombre_gimnasio }}. Esto es lo que está pasando hoy.
          <span v-if="userStore.isAdmin" class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
            Admin
          </span>
          <span v-else-if="userStore.isStaff" class="ml-2 px-2 py-1 bg-secondary-100 text-secondary-800 text-xs font-semibold rounded">
            Staff
          </span>
        </p>

        <!-- Action Cards - Optimizado para Mobile/Tablet -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
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

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Cargando estadísticas...</p>
      </div>

      <div v-else>
        <!-- Tarjetas de Métricas -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Ingresos del Mes"
            :value="'$' + formatCurrency(stats.monthlyRevenue)"
            :icon="Wallet"
            icon-bg-color="bg-primary-50"
            icon-color="text-primary-600"
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
          />
          
          <StatCard
            title="Socios Vencidos"
            :value="stats.expiredMembers"
            :icon="AlertCircle"
            route="/miembros"
            icon-bg-color="bg-red-50"
            icon-color="text-red-600"
          />
        </div>

        <!-- Tarjeta de Alerta: Socios Vencidos -->
        <div v-if="stats.expiredMembers > 0" class="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-8">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-4">
              <div class="p-3 bg-red-100 rounded-lg">
                <AlertCircle class="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-red-900 mb-1">
                  {{ stats.expiredMembers }} Socios con Cuota Vencida
                </h3>
                <p class="text-sm text-red-700">
                  Hay socios con pagos pendientes que requieren atención
                </p>
              </div>
            </div>
            <BaseButton
              variant="danger"
              @click="router.push({ name: 'Members', query: { filter: 'vencidos' } })"
              class="flex items-center gap-2"
            >
              Ver Listado
            </BaseButton>
          </div>
        </div>

        <!-- Últimos Check-Ins -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-800">Últimos Check-Ins</h2>
            <BaseButton
              variant="ghost"
              @click="showLastAccessModal = true"
              size="sm"
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
                <tr class="border-b border-gray-100">
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Socio</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">DNI</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Hora</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="checkin in recentCheckIns" 
                  :key="checkin.id"
                  class="border-b border-gray-50 hover:bg-primary-50 transition-colors"
                >
                  <td class="py-4 px-4 text-sm text-gray-800 font-medium">
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      class="w-full justify-start px-0 py-0 hover:bg-transparent focus:ring-0"
                      @click="goToMember(checkin.memberId)"
                    >
                      {{ checkin.name }}
                    </BaseButton>
                  </td>
                  <td class="py-4 px-4 text-sm text-gray-500">{{ checkin.dni }}</td>
                  <td class="py-4 px-4 text-sm text-gray-500">{{ checkin.time }}</td>
                  <td class="py-4 px-4">
                    <StatusBadge
                      :status="checkin.status"
                      :label="checkin.statusLabel"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="recentCheckIns.length === 0" class="text-center py-8 text-gray-400">
              No hay check-ins recientes
            </div>
          </div>
        </div>

        <!-- Gráfico de Asistencia Semanal -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
          <h2 class="text-xl font-bold text-gray-800 mb-6">Asistencia Semanal</h2>
          <AssistanceChart />
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
import { errorAlert } from '@/lib/alerts'
import { formatCurrency } from '@/utils/formatters'
import { useAttendance } from '@/composables/useAttendance'
import { Wallet, Users, Activity, AlertCircle, UserPlus, BadgeDollarSign, CheckCircle, ListChecks } from 'lucide-vue-next'
import StatCard from '@/components/dashboard/StatCard.vue'
import DashboardActionCard from '@/components/dashboard/DashboardActionCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LastAccessModal from '@/components/modals/LastAccessModal.vue'
import AssistanceChart from '@/components/charts/AssistanceChart.vue'

const router = useRouter()
const userStore = useUserStore()
const gymStore = useGymStore()
const { settings } = useSettings()

const loading = ref(false)
const showLastAccessModal = ref(false)
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
  } catch (err) {
    console.error('Error cargando estadísticas:', err)
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

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadRecentCheckIns()
  ])

  unsubscribeRealtime = subscribeToAttendanceInserts({
    channelName: 'dashboard-attendance',
    onInsert: scheduleStatsRefresh,
    limit: 5
  })
})

onUnmounted(() => {
  if (statsRefreshTimer) clearTimeout(statsRefreshTimer)
  if (typeof unsubscribeRealtime === 'function') unsubscribeRealtime()
  unsubscribe()
})
</script>

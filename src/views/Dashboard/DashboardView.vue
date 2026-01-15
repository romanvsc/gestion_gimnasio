<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p class="text-gray-400 mb-6">
          Bienvenido a {{ settings.nombre_gimnasio }}, {{ userStore.userEmail }}
          <span v-if="userStore.isAdmin" class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
            Admin
          </span>
          <span v-else-if="userStore.isStaff" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
            Staff
          </span>
        </p>

        <!-- Botones de Acceso Rápido -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BaseButton
            variant="primary"
            @click="router.push({ name: 'NewMember' })"
            class="flex items-center justify-center gap-2 py-3"
          >
            <UserPlus class="w-5 h-5" />
            Nuevo Socio
          </BaseButton>

          <BaseButton
            variant="primary"
            @click="router.push({ name: 'NewPayment' })"
            class="flex items-center justify-center gap-2 py-3"
          >
            <BadgeDollarSign class="w-5 h-5" />
            Registrar Pago
          </BaseButton>

          <BaseButton
            variant="primary"
            @click="router.push({ name: 'CheckIn' })"
            class="flex items-center justify-center gap-2 py-3"
          >
            <CheckCircle class="w-5 h-5" />
            Check-In
          </BaseButton>

          <BaseButton
            variant="secondary"
            @click="showLastAccessModal = true"
            class="flex items-center justify-center gap-2 py-3"
          >
            <ListChecks class="w-5 h-5" />
            Ver Últimos Accesos
          </BaseButton>
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
            trend="+12%"
            :icon="Wallet"
            route="/analytics?tab=revenue"
            icon-bg-color="bg-emerald-50"
            icon-color="text-emerald-600"
          />
          
          <StatCard
            title="Socios Activos"
            :value="stats.activeMembers"
            trend="+8%"
            :icon="Users"
            route="/analytics?tab=members"
            icon-bg-color="bg-blue-50"
            icon-color="text-blue-600"
          />
          
          <StatCard
            title="Asistencia Hoy"
            :value="stats.todayAttendance"
            trend="+5%"
            :icon="Activity"
            route="/analytics?tab=attendance"
            icon-bg-color="bg-purple-50"
            icon-color="text-purple-600"
          />
          
          <StatCard
            title="Socios Vencidos"
            :value="stats.expiredMembers"
            trend="-3%"
            :icon="AlertCircle"
            route="/miembros"
            icon-bg-color="bg-red-50"
            icon-color="text-red-600"
          />
        </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- Gráfico de Ingresos (2/3) -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Ingresos Mensuales</h3>
            <RevenueChart />
          </div>

          <!-- Gráfico de Asistencia (1/3) -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Asistencia Semanal</h3>
            <AssistanceChart />
          </div>
        </div>

        <!-- Últimos Check-Ins -->
        <div class="bg-white rounded-xl shadow-sm p-6">
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

          <div class="overflow-x-auto">
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
                  class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4 text-sm text-gray-800">{{ checkin.name }}</td>
                  <td class="py-3 px-4 text-sm text-gray-500">{{ checkin.dni }}</td>
                  <td class="py-3 px-4 text-sm text-gray-500">{{ checkin.time }}</td>
                  <td class="py-3 px-4">
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
import { Wallet, Users, Activity, AlertCircle, UserPlus, BadgeDollarSign, CheckCircle, ListChecks } from 'lucide-vue-next'
import StatCard from '@/components/dashboard/StatCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AssistanceChart from '@/components/charts/AssistanceChart.vue'
import RevenueChart from '@/components/charts/RevenueChart.vue'
import LastAccessModal from '@/components/modals/LastAccessModal.vue'

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

// Mock data para últimos check-ins
const recentCheckIns = ref([
  { id: 1, name: 'Juan Pérez', dni: '12345678', time: '14:30', status: 'activo', statusLabel: 'Al día' },
  { id: 2, name: 'María García', dni: '87654321', time: '14:15', status: 'activo', statusLabel: 'Al día' },
  { id: 3, name: 'Carlos López', dni: '11223344', time: '14:00', status: 'vencido', statusLabel: 'Vencido' }
])

async function loadStats() {
  loading.value = true
  try {
    await gymStore.getStats()
    stats.value = gymStore.stats
  } catch (err) {
    console.error('Error cargando estadísticas:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadStats()
})

function formatCurrency(value) {
  return value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">Dashboard</h1>
        <p class="text-page-subtitle mb-6">
          Bienvenido a {{ settings.nombre_gimnasio }}, {{ userStore.userEmail }}
          <span v-if="userStore.isAdmin" class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
            Admin
          </span>
          <span v-else-if="userStore.isStaff" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
            Staff
          </span>
        </p>

        <!-- Action Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            @click="router.push({ name: 'NewMember' })"
            class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-100 transition-all duration-200 group text-center"
          >
            <div class="p-3 bg-primary-50 text-primary-600 rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
              <UserPlus class="w-6 h-6" />
            </div>
            <span class="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">Nuevo Socio</span>
            <span class="text-xs text-gray-400 mt-1">Registrar nueva alta</span>
          </button>

          <button
            @click="router.push({ name: 'NewPayment' })"
            class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-100 transition-all duration-200 group text-center"
          >
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
              <BadgeDollarSign class="w-6 h-6" />
            </div>
            <span class="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">Registrar Pago</span>
            <span class="text-xs text-gray-400 mt-1">Ingresar cuota</span>
          </button>

          <button
            @click="router.push({ name: 'CheckIn' })"
            class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all duration-200 group text-center"
          >
            <div class="p-3 bg-purple-50 text-purple-600 rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
              <CheckCircle class="w-6 h-6" />
            </div>
            <span class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Check-In</span>
            <span class="text-xs text-gray-400 mt-1">Control de acceso</span>
          </button>

          <button
            @click="showLastAccessModal = true"
            class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-200 group text-center"
          >
            <div class="p-3 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform duration-200">
              <ListChecks class="w-6 h-6" />
            </div>
            <span class="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Últimos Accesos</span>
            <span class="text-xs text-gray-400 mt-1">Historial reciente</span>
          </button>
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
            icon-bg-color="bg-primary-50"
            icon-color="text-primary-600"
          />
          
          <StatCard
            title="Socios Activos"
            :value="stats.activeMembers"
            trend="+8%"
            :icon="Users"
            route="/miembros"
            icon-bg-color="bg-blue-50"
            icon-color="text-blue-600"
          />
          
          <StatCard
            title="Asistencia Hoy"
            :value="stats.todayAttendance"
            trend="+5%"
            :icon="Activity"
            route="/checkin"
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

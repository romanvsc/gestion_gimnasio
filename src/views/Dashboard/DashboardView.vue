<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600">
          Bienvenido, {{ userStore.userEmail }}
          <span v-if="userStore.isAdmin" class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
            Admin
          </span>
          <span v-else-if="userStore.isStaff" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
            Staff
          </span>
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Cargando estadísticas...</p>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Total Socios -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Socios</dt>
                  <dd class="text-3xl font-semibold text-gray-900">{{ stats.totalMembers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Socios Activos -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Al Día</dt>
                  <dd class="text-3xl font-semibold text-green-600">{{ stats.activeMembers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Socios Vencidos -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Vencidos</dt>
                  <dd class="text-3xl font-semibold text-red-600">{{ stats.expiredMembers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Asistencia Hoy -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Asistencia Hoy</dt>
                  <dd class="text-3xl font-semibold text-blue-600">{{ stats.todayAttendance }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ingresos del Mes -->
      <div class="bg-white overflow-hidden shadow rounded-lg mb-8">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Ingresos del Mes</h3>
              <p class="text-3xl font-bold text-green-600 mt-2">
                ${{ formatCurrency(stats.monthlyRevenue) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Accesos Rápidos -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseButton
            variant="primary"
            full-width
            @click="router.push({ name: 'CheckIn' })"
          >
            Check-In
          </BaseButton>
          <BaseButton
            variant="primary"
            full-width
            @click="router.push({ name: 'NewPayment' })"
          >
            Nuevo Pago
          </BaseButton>
          <BaseButton
            variant="primary"
            full-width
            @click="router.push({ name: 'NewMember' })"
          >
            Nuevo Socio
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useGymStore } from '@/stores/gymStore'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()
const gymStore = useGymStore()

const stats = computed(() => gymStore.stats)
const loading = computed(() => gymStore.loading)

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

onMounted(async () => {
  await gymStore.getStats()
})
</script>

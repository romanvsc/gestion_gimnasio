<template>
  <div>
    <!-- Grid de Alertas -->
    <div class="grid md:grid-cols-2 gap-6">
      
      <!-- Tarjeta A: Socios Vencidos -->
      <div class="bg-page-card rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-page-title mb-1">Cuotas Vencidas</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Socios activos con pagos pendientes</p>
          </div>
          <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle class="w-6 h-6 text-red-600" />
          </div>
        </div>
        
        <!-- KPI -->
        <div class="mb-4">
          <p class="text-5xl font-bold text-red-600">
            {{ loading.overdue ? '...' : overdueMembers.length }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Socios activos con deuda</p>
        </div>

        <div v-if="overdueMembers.length > 0" class="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div class="rounded-lg bg-red-50 px-2 py-2 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            <strong class="block text-base">{{ overdueBuckets.recent }}</strong>
            Hasta 7 días
          </div>
          <div class="rounded-lg bg-orange-50 px-2 py-2 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
            <strong class="block text-base">{{ overdueBuckets.medium }}</strong>
            8 a 30 días
          </div>
          <div class="rounded-lg bg-gray-100 px-2 py-2 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            <strong class="block text-base">{{ overdueBuckets.old }}</strong>
            Más de 30 días
          </div>
        </div>

        <p v-if="lastUpdatedAt && overdueMembers.length > 0" class="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Actualizado: {{ formatDateTime(lastUpdatedAt) }} · Revisá la fecha de vencimiento en el listado.
        </p>

        <!-- Botón Ver Listado -->
        <BaseButton
          v-if="loading.overdue || overdueMembers.length > 0"
          variant="danger"
          @click="handleShowOverdue"
          class="w-full"
          :disabled="loading.overdue || overdueMembers.length === 0"
        >
          <FileText class="w-4 h-4 mr-2" />
          Ver Listado Completo
        </BaseButton>
        <p v-else class="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300" role="status">
          No hay socios activos con cuotas vencidas.
        </p>
      </div>

      <!-- Tarjeta B: Socios Inactivos -->
      <div class="bg-page-card rounded-lg shadow-md p-6 border-l-4 border-gray-400 dark:border-gray-500">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-page-title mb-1">Socios Inactivos</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Usuarios dados de baja</p>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
            <UserX class="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        
        <!-- KPI -->
        <div class="mb-4">
          <p class="text-5xl font-bold text-gray-600 dark:text-gray-400">
            {{ loading.inactive ? '...' : inactiveMembers.length }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Total de bajas registradas</p>
        </div>

        <!-- Botón Ver Listado -->
        <BaseButton
          v-if="loading.inactive || inactiveMembers.length > 0"
          variant="secondary"
          @click="handleShowInactive"
          class="w-full"
          :disabled="loading.inactive || inactiveMembers.length === 0"
        >
          <FileText class="w-4 h-4 mr-2" />
          Ver Listado Completo
        </BaseButton>
        <p v-else class="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300" role="status">
          No hay bajas registradas en el período.
        </p>
      </div>

    </div>

    <!-- Modales Externos -->
    <OverdueMembersModal
      :visible="showOverdueModal"
      :members="overdueMembers"
      @close="showOverdueModal = false"
      @export="handleExportOverdue"
    />

    <InactiveMembersModal
      :visible="showInactiveModal"
      :members="inactiveMembers"
      @close="showInactiveModal = false"
      @export="handleExportInactive"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useReports } from '@/composables/useReports'
import BaseButton from '@/components/ui/BaseButton.vue'
import OverdueMembersModal from '@/components/modals/OverdueMembersModal.vue'
import InactiveMembersModal from '@/components/modals/InactiveMembersModal.vue'
import { AlertCircle, UserX, FileText } from 'lucide-vue-next'
import { formatDateTime } from '@/utils/formatters'

const {
  overdueMembers,
  inactiveMembers,
  loading,
  fetchOverdueMembers,
  fetchInactiveMembers,
  exportOverdueMembers,
  exportInactiveMembers
} = useReports()

const showOverdueModal = ref(false)
const showInactiveModal = ref(false)
const lastUpdatedAt = ref(null)

const overdueBuckets = computed(() => {
  return overdueMembers.value.reduce((buckets, member) => {
    const daysOverdue = Number(member.dias_vencido) || 0
    if (daysOverdue <= 7) buckets.recent += 1
    else if (daysOverdue <= 30) buckets.medium += 1
    else buckets.old += 1
    return buckets
  }, { recent: 0, medium: 0, old: 0 })
})

onMounted(async () => {
  await Promise.all([
    fetchOverdueMembers(),
    fetchInactiveMembers()
  ])
  lastUpdatedAt.value = new Date()
})

function handleShowOverdue() {
  if (overdueMembers.value.length === 0) {
    toast.info('No hay socios con cuotas vencidas')
    return
  }
  showOverdueModal.value = true
}

function handleShowInactive() {
  if (inactiveMembers.value.length === 0) {
    toast.info('No hay socios inactivos')
    return
  }
  showInactiveModal.value = true
}

async function handleExportOverdue() {
  const result = await exportOverdueMembers()
  if (result.success) {
    toast.success('Archivo Excel descargado correctamente')
  } else {
    toast.error('Error al exportar: ' + result.error)
  }
}

async function handleExportInactive() {
  const result = await exportInactiveMembers()
  if (result.success) {
    toast.success('Archivo Excel descargado correctamente')
  } else {
    toast.error('Error al exportar: ' + result.error)
  }
}
</script>

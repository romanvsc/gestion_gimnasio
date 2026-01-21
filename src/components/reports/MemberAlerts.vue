<template>
  <div>
    <!-- Grid de Alertas -->
    <div class="grid md:grid-cols-2 gap-6">
      
      <!-- Tarjeta A: Socios Vencidos -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">Cuotas Vencidas</h3>
            <p class="text-sm text-gray-600">Socios con pagos pendientes</p>
          </div>
          <div class="p-3 bg-red-50 rounded-lg">
            <AlertCircle class="w-6 h-6 text-red-600" />
          </div>
        </div>
        
        <!-- KPI -->
        <div class="mb-4">
          <p class="text-5xl font-bold text-red-600">
            {{ loading.overdue ? '...' : overdueMembers.length }}
          </p>
          <p class="text-sm text-gray-500 mt-1">Socios activos con deuda</p>
        </div>

        <!-- Botón Ver Listado -->
        <BaseButton
          variant="danger"
          @click="handleShowOverdue"
          class="w-full"
          :disabled="loading.overdue || overdueMembers.length === 0"
        >
          <FileText class="w-4 h-4 mr-2" />
          Ver Listado Completo
        </BaseButton>
      </div>

      <!-- Tarjeta B: Socios Inactivos -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">Socios Inactivos</h3>
            <p class="text-sm text-gray-600">Usuarios dados de baja</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
            <UserX class="w-6 h-6 text-gray-600" />
          </div>
        </div>
        
        <!-- KPI -->
        <div class="mb-4">
          <p class="text-5xl font-bold text-gray-600">
            {{ loading.inactive ? '...' : inactiveMembers.length }}
          </p>
          <p class="text-sm text-gray-500 mt-1">Total de bajas registradas</p>
        </div>

        <!-- Botón Ver Listado -->
        <BaseButton
          variant="secondary"
          @click="handleShowInactive"
          class="w-full"
          :disabled="loading.inactive || inactiveMembers.length === 0"
        >
          <FileText class="w-4 h-4 mr-2" />
          Ver Listado Completo
        </BaseButton>
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
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useReports } from '@/composables/useReports'
import BaseButton from '@/components/ui/BaseButton.vue'
import OverdueMembersModal from '@/components/modals/OverdueMembersModal.vue'
import InactiveMembersModal from '@/components/modals/InactiveMembersModal.vue'
import { AlertCircle, UserX, FileText } from 'lucide-vue-next'

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

onMounted(async () => {
  await Promise.all([
    fetchOverdueMembers(),
    fetchInactiveMembers()
  ])
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

function handleExportOverdue() {
  const result = exportOverdueMembers()
  if (result.success) {
    toast.success('Archivo Excel descargado correctamente')
  } else {
    toast.error('Error al exportar: ' + result.error)
  }
}

function handleExportInactive() {
  const result = exportInactiveMembers()
  if (result.success) {
    toast.success('Archivo Excel descargado correctamente')
  } else {
    toast.error('Error al exportar: ' + result.error)
  }
}
</script>

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

    <!-- Modal: Socios Vencidos -->
    <Teleport to="body">
      <div v-if="showOverdueModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          <!-- Overlay -->
          <div 
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            @click="showOverdueModal = false"
          ></div>

          <!-- Modal Panel -->
          <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <!-- Header -->
            <div class="bg-red-50 px-6 py-4 border-b border-red-100">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-red-900 flex items-center gap-2">
                  <AlertCircle class="w-5 h-5" />
                  Socios con Cuota Vencida ({{ overdueMembers.length }})
                </h3>
                <button 
                  @click="showOverdueModal = false"
                  class="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Tabla -->
            <div class="px-6 py-4 max-h-96 overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apellido y Nombre</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="member in overdueMembers" :key="member.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ member.dni }}</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">
                      {{ member.apellido }}, {{ member.nombre }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ member.email || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ member.telefono || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-red-600 font-medium">
                      {{ formatDate(member.fecha_fin_cuota) }}
                      <span v-if="member.dias_vencido" class="text-xs block text-gray-500">
                        ({{ member.dias_vencido }} días)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <p class="text-sm text-gray-600">
                Total: {{ overdueMembers.length }} socios
              </p>
              <div class="flex gap-3">
                <BaseButton variant="secondary" @click="showOverdueModal = false">
                  Cerrar
                </BaseButton>
                <BaseButton variant="primary" @click="handleExportOverdue">
                  <Download class="w-4 h-4 mr-2" />
                  Exportar Excel
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Socios Inactivos -->
    <Teleport to="body">
      <div v-if="showInactiveModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          <!-- Overlay -->
          <div 
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            @click="showInactiveModal = false"
          ></div>

          <!-- Modal Panel -->
          <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <!-- Header -->
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserX class="w-5 h-5" />
                  Socios Inactivos ({{ inactiveMembers.length }})
                </h3>
                <button 
                  @click="showInactiveModal = false"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Tabla -->
            <div class="px-6 py-4 max-h-96 overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apellido y Nombre</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Baja</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="member in inactiveMembers" :key="member.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ member.dni }}</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">
                      {{ member.apellido }}, {{ member.nombre }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ member.email || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ member.telefono || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">
                      {{ formatDate(member.fecha_baja) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <p class="text-sm text-gray-600">
                Total: {{ inactiveMembers.length }} socios
              </p>
              <div class="flex gap-3">
                <BaseButton variant="secondary" @click="showInactiveModal = false">
                  Cerrar
                </BaseButton>
                <BaseButton variant="primary" @click="handleExportInactive">
                  <Download class="w-4 h-4 mr-2" />
                  Exportar Excel
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useReports } from '@/composables/useReports'
import BaseButton from '@/components/ui/BaseButton.vue'
import { AlertCircle, UserX, FileText, X, Download } from 'lucide-vue-next'

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

async function handleShowOverdue() {
  if (overdueMembers.value.length === 0) {
    toast.info('No hay socios con cuotas vencidas')
    return
  }
  showOverdueModal.value = true
}

async function handleShowInactive() {
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

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
}
</script>

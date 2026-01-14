<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ListChecks class="w-6 h-6 text-emerald-600" />
          Últimos Accesos al Gimnasio
        </h3>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-emerald-600"></div>
          <p class="mt-4 text-gray-500">Cargando accesos...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Table -->
        <div v-else-if="accesses.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Socio</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="access in accesses" :key="access.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span class="text-sm font-semibold text-emerald-700">
                        {{ getInitials(access.members?.nombre, access.members?.apellido) }}
                      </span>
                    </div>
                    <span class="text-sm font-medium text-gray-900">
                      {{ access.members?.nombre }} {{ access.members?.apellido }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ access.members?.dni || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ formatDateTime(access.created_at) }}</td>
                <td class="px-4 py-3">
                  <StatusBadge
                    :status="access.acceso_permitido ? 'activo' : 'vencido'"
                    :label="access.acceso_permitido ? 'Permitido' : 'Denegado'"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <ListChecks class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">No hay accesos registrados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { ListChecks, X } from 'lucide-vue-next'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineEmits(['close'])

const accesses = ref([])
const loading = ref(false)
const error = ref(null)

function getInitials(nombre, apellido) {
  const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : ''
  const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : ''
  return firstInitial + lastInitial
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadLastAccesses() {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('attendance')
      .select('*, members(nombre, apellido, dni, foto_url)')
      .order('created_at', { ascending: false })
      .limit(20)

    if (fetchError) {
      console.error('Error en query attendance:', fetchError)
      throw new Error(`Error al consultar accesos: ${fetchError.message}`)
    }

    accesses.value = data || []
  } catch (err) {
    console.error('Error cargando accesos:', err)
    error.value = err.message || 'Error al cargar los accesos'
    // Resetear en caso de error
    accesses.value = []
  } finally {
    // CRÍTICO: Siempre liberar el loading
    loading.value = false
  }
}

onMounted(() => {
  loadLastAccesses()
})
</script>

<template>
  <div class="bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Check-In</h1>
        <p class="text-gray-600">Registra el ingreso de los socios al gimnasio</p>
      </div>

      <!-- Buscador -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <BaseInput
          v-model="searchQuery"
          type="text"
          label="Buscar Socio"
          placeholder="Nombre, apellido o DNI..."
          @input="searchMembers"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">Buscando...</p>
      </div>

      <!-- Resultados de búsqueda -->
      <div v-else-if="searchResults.length > 0" class="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div class="divide-y divide-gray-200">
          <div
            v-for="member in searchResults"
            :key="member.id"
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ member.nombre }} {{ member.apellido }}
                </h3>
                <p class="text-sm text-gray-500">DNI: {{ member.dni }}</p>
                <div class="flex gap-2 mt-2">
                  <StatusBadge
                    :status="member.estado_cuota"
                    :label="member.estado_cuota === 'activo' ? 'Al día' : 'Vencido'"
                  />
                  <StatusBadge
                    :status="member.estado_apto_fisico === 'vigente' ? 'vigente' : 'vencido_apto'"
                    :label="member.estado_apto_fisico === 'vigente' ? 'Apto OK' : 'Apto Vencido'"
                  />
                </div>
              </div>
              <BaseButton
                :variant="canCheckIn(member) ? 'primary' : 'danger'"
                @click="handleCheckIn(member)"
              >
                {{ canCheckIn(member) ? 'Check-In' : 'Registrar' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="searchQuery && !loading" class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">No se encontraron socios</p>
      </div>

      <!-- Últimos Check-Ins -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Últimos Check-Ins</h2>
        
        <div v-if="recentCheckIns.length > 0" class="divide-y divide-gray-200">
          <div
            v-for="checkIn in recentCheckIns"
            :key="checkIn.id"
            class="py-3 flex justify-between items-center"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ checkIn.member_name }}</p>
              <p class="text-xs text-gray-500">{{ formatTime(checkIn.created_at) }}</p>
            </div>
            <span :class="[
              'px-2 py-1 text-xs rounded',
              checkIn.acceso_permitido ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]">
              {{ checkIn.acceso_permitido ? 'Permitido' : 'Con observación' }}
            </span>
          </div>
        </div>
        
        <p v-else class="text-gray-500 text-center py-4">
          No hay check-ins recientes
        </p>
      </div>

      <!-- Modal de confirmación -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
          <h3 class="text-xl font-bold mb-4">
            {{ modalData.allowed ? 'Check-In Exitoso' : 'Check-In con Observación' }}
          </h3>
          <p class="mb-6">
            {{ modalData.message }}
          </p>
          <BaseButton
            variant="primary"
            full-width
            @click="closeModal"
          >
            Cerrar
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const searchQuery = ref('')
const searchResults = ref([])
const recentCheckIns = ref([])
const loading = ref(false)
const showModal = ref(false)
const modalData = ref({ allowed: true, message: '' })

let searchTimeout = null

async function searchMembers() {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      const query = searchQuery.value.toLowerCase()
      const { data } = await supabase
        .from('v_socios_estado')
        .select('*')
        .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,dni.ilike.%${query}%`)
        .limit(5)

      searchResults.value = data || []
    } catch (error) {
      console.error('Error buscando socios:', error)
    } finally {
      loading.value = false
    }
  }, 300)
}

function canCheckIn(member) {
  return member.estado_cuota === 'activo' && member.estado_apto_fisico === 'vigente'
}

async function handleCheckIn(member) {
  const allowed = canCheckIn(member)
  
  try {
    // Registrar asistencia
    const { error } = await supabase
      .from('attendance')
      .insert([{
        member_id: member.id,
        acceso_permitido: allowed
      }])

    if (error) throw error

    // Mostrar modal
    let message = `Check-in registrado para ${member.nombre} ${member.apellido}.`
    if (!allowed) {
      const warnings = []
      if (member.estado_cuota !== 'activo') warnings.push('cuota vencida')
      if (member.estado_apto_fisico !== 'vigente') warnings.push('apto físico vencido')
      message += ` Advertencia: ${warnings.join(' y ')}.`
    }

    modalData.value = { allowed, message }
    showModal.value = true

    // Limpiar búsqueda y recargar recientes
    searchQuery.value = ''
    searchResults.value = []
    await loadRecentCheckIns()
  } catch (error) {
    console.error('Error en check-in:', error)
    alert('Error al registrar check-in')
  }
}

function closeModal() {
  showModal.value = false
}

async function loadRecentCheckIns() {
  try {
    const { data } = await supabase
      .from('attendance')
      .select(`
        *,
        members:member_id (
          nombre,
          apellido
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    recentCheckIns.value = data?.map(item => ({
      ...item,
      member_name: `${item.members.nombre} ${item.members.apellido}`
    })) || []
  } catch (error) {
    console.error('Error cargando check-ins:', error)
  }
}

function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
}

onMounted(() => {
  loadRecentCheckIns()
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Registrar Pago</h1>
        <p class="text-gray-600">Registra un nuevo pago de membresía</p>
      </div>

      <!-- Grid de 2 columnas -->
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Columna Izquierda: Formulario -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Datos del Pago</h2>
            
            <!-- Buscar Socio -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Buscar Socio *
              </label>
              <input
                v-model="memberSearch"
                type="text"
                placeholder="Nombre, apellido o DNI..."
                class="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                @input="searchMembers"
              />
              
              <!-- Resultados de búsqueda -->
              <div v-if="memberSearchResults.length > 0" class="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                <button
                  v-for="member in memberSearchResults"
                  :key="member.id"
                  type="button"
                  class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  @click="selectMember(member)"
                >
                  <p class="font-medium text-gray-900">{{ member.nombre }} {{ member.apellido }}</p>
                  <p class="text-sm text-gray-500">DNI: {{ member.dni }}</p>
                </button>
              </div>

              <!-- Socio seleccionado -->
              <div v-if="selectedMember" class="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-medium text-emerald-900">{{ selectedMember.nombre }} {{ selectedMember.apellido }}</p>
                    <p class="text-sm text-emerald-700">DNI: {{ selectedMember.dni }}</p>
                  </div>
                  <button
                    type="button"
                    class="text-gray-400 hover:text-red-600 transition-colors"
                    @click="clearMember"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <!-- Seleccionar Plan -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Plan *
              </label>
              <select
                v-model="formData.plan_id"
                class="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                @change="updateDates"
              >
                <option value="" disabled>Seleccionar plan...</option>
                <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                  {{ plan.nombre }} - ${{ plan.precio }} ({{ plan.dias_duracion }} días)
                </option>
              </select>
            </div>

            <!-- Método de Pago -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago *
              </label>
              <select
                v-model="formData.metodo_pago"
                class="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="" disabled>Seleccionar método...</option>
                <option v-for="method in paymentMethods" :key="method.id" :value="method.nombre">
                  {{ method.nombre }}
                </option>
              </select>
            </div>

            <!-- Fecha de Inicio -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                v-model="formData.fecha_inicio"
                type="date"
                class="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                @change="updateDates"
              />
            </div>

            <!-- Error general -->
            <div 
              v-if="error" 
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {{ error }}
            </div>
          </div>

          <!-- Columna Derecha: Resumen de Pago -->
          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border border-emerald-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">Resumen de Pago</h2>
            
            <div class="space-y-6">
              <!-- Monto a Pagar -->
              <div class="text-center py-6 bg-white rounded-lg shadow-sm">
                <p class="text-sm text-gray-600 mb-2">Monto a Pagar</p>
                <p class="text-5xl font-bold text-emerald-600">
                  {{ formData.monto ? `$${formData.monto}` : '$0' }}
                </p>
              </div>

              <!-- Plan Seleccionado -->
              <div class="bg-white rounded-lg p-4 shadow-sm">
                <p class="text-xs text-gray-500 uppercase font-semibold mb-2">Plan Seleccionado</p>
                <p class="text-base font-medium text-gray-900">
                  {{ selectedPlanName || 'Ningún plan seleccionado' }}
                </p>
              </div>

              <!-- Fechas -->
              <div class="bg-white rounded-lg p-4 shadow-sm space-y-3">
                <div>
                  <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Fecha de Inicio</p>
                  <p class="text-base font-medium text-gray-900">
                    {{ formattedStartDate || '—' }}
                  </p>
                </div>
                <div class="border-t border-gray-100 pt-3">
                  <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Fecha de Fin</p>
                  <p class="text-base font-medium text-gray-900">
                    {{ formattedEndDate || '—' }}
                  </p>
                </div>
                <div v-if="durationDays" class="border-t border-gray-100 pt-3">
                  <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Duración</p>
                  <p class="text-base font-medium text-emerald-600">
                    {{ durationDays }} días
                  </p>
                </div>
              </div>

              <!-- Método de Pago -->
              <div class="bg-white rounded-lg p-4 shadow-sm">
                <p class="text-xs text-gray-500 uppercase font-semibold mb-2">Método de Pago</p>
                <p class="text-base font-medium text-gray-900">
                  {{ paymentMethodLabel || '—' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="mt-6 flex gap-3">
          <button
            type="submit"
            :disabled="!selectedMember || loading"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {{ loading ? 'Procesando...' : 'Registrar Pago' }}
          </button>

          <button
            type="button"
            @click="resetForm"
            :disabled="loading"
            class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Limpiar
          </button>
        </div>
      </form>

      <!-- Modal de éxito -->
      <div v-if="showSuccessModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
          <div class="text-center">
            <h3 class="text-xl font-bold mb-2">Pago Registrado</h3>
            <p class="text-gray-600 mb-6">
              El pago se ha registrado exitosamente.
            </p>
            <BaseButton
              variant="primary"
              full-width
              @click="closeSuccessModal"
            >
              Aceptar
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { usePayments } from '@/composables/usePayments'
import { useParameters } from '@/composables/useParameters'
import BaseButton from '@/components/ui/BaseButton.vue'

const { createPayment } = usePayments()
const { plans, paymentMethods, loading, error, fetchParameters } = useParameters()

const memberSearch = ref('')
const memberSearchResults = ref([])
const selectedMember = ref(null)
const showSuccessModal = ref(false)

const formData = ref({
  member_id: '',
  plan_id: '',
  monto: '',
  metodo_pago: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: ''
})

let searchTimeout = null

// Computed properties para el resumen
const selectedPlanName = computed(() => {
  if (!formData.value.plan_id) return null
  const plan = plans.value.find(p => p.id == formData.value.plan_id)
  return plan ? plan.nombre : null
})

const durationDays = computed(() => {
  if (!formData.value.plan_id) return null
  const plan = plans.value.find(p => p.id == formData.value.plan_id)
  return plan ? plan.dias_duracion : null
})

const formattedStartDate = computed(() => {
  if (!formData.value.fecha_inicio) return null
  const date = new Date(formData.value.fecha_inicio + 'T00:00:00')
  return date.toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })
})

const formattedEndDate = computed(() => {
  if (!formData.value.fecha_fin) return null
  const date = new Date(formData.value.fecha_fin + 'T00:00:00')
  return date.toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })
})

const paymentMethodLabel = computed(() => {
  return formData.value.metodo_pago || '—'
})

async function searchMembers() {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (!memberSearch.value || memberSearch.value.length < 2) {
    memberSearchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      const query = memberSearch.value.toLowerCase()
      const { data } = await supabase
        .from('members')
        .select('id, nombre, apellido, dni')
        .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,dni.ilike.%${query}%`)
        .limit(5)

      memberSearchResults.value = data || []
    } catch (err) {
      console.error('Error buscando socios:', err)
    }
  }, 300)
}

function selectMember(member) {
  selectedMember.value = member
  formData.value.member_id = member.id
  memberSearch.value = `${member.nombre} ${member.apellido}`
  memberSearchResults.value = []
}

function clearMember() {
  selectedMember.value = null
  formData.value.member_id = ''
  memberSearch.value = ''
}

function updateDates() {
  if (!formData.value.plan_id || !formData.value.fecha_inicio) return

  const plan = plans.value.find(p => p.id == formData.value.plan_id)
  if (!plan) return

  // Actualizar monto
  formData.value.monto = plan.precio

  // Calcular fecha fin
  const startDate = new Date(formData.value.fecha_inicio)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + plan.dias_duracion)
  formData.value.fecha_fin = endDate.toISOString().split('T')[0]
}

async function handleSubmit() {
  if (!selectedMember.value) {
    alert('Por favor selecciona un socio')
    return
  }

  const result = await createPayment(formData.value)

  if (result.success) {
    showSuccessModal.value = true
    resetForm()
  }
}

function resetForm() {
  formData.value = {
    member_id: '',
    plan_id: '',
    monto: '',
    metodo_pago: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: ''
  }
  selectedMember.value = null
  memberSearch.value = ''
  memberSearchResults.value = []
}

function closeSuccessModal() {
  showSuccessModal.value = false
}

onMounted(async () => {
  await fetchParameters()
})
</script>

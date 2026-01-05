<template>
  <div class="bg-gray-50">
    <div class="max-w-3xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Registrar Pago</h1>
        <p class="text-gray-600">Registra un nuevo pago de membresía</p>
      </div>

      <!-- Formulario -->
      <div class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Buscar Socio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Buscar Socio *
            </label>
            <BaseInput
              v-model="memberSearch"
              type="text"
              placeholder="Nombre, apellido o DNI..."
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
            <div v-if="selectedMember" class="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-medium text-green-900">{{ selectedMember.nombre }} {{ selectedMember.apellido }}</p>
                  <p class="text-sm text-green-700">DNI: {{ selectedMember.dni }}</p>
                </div>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-800"
                  @click="clearMember"
                >
                  ✖
                </button>
              </div>
            </div>
          </div>

          <!-- Seleccionar Plan -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Plan *
            </label>
            <select
              v-model="formData.plan_id"
              class="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
              @change="updateDates"
            >
              <option value="" disabled>Seleccionar plan...</option>
              <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                {{ plan.nombre }} - ${{ plan.precio }} ({{ plan.dias_duracion }} días)
              </option>
            </select>
          </div>

          <!-- Monto -->
          <BaseInput
            v-model="formData.monto"
            type="number"
            step="0.01"
            label="Monto"
            placeholder="0.00"
            required
          />

          <!-- Método de Pago -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago *
            </label>
            <select
              v-model="formData.metodo_pago"
              class="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="" disabled>Seleccionar método...</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_debito">Tarjeta de Débito</option>
              <option value="tarjeta_credito">Tarjeta de Crédito</option>
              <option value="mercadopago">Mercado Pago</option>
            </select>
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.fecha_inicio"
              type="date"
              label="Fecha Inicio"
              required
              @change="updateDates"
            />

            <BaseInput
              v-model="formData.fecha_fin"
              type="date"
              label="Fecha Fin"
              required
              readonly
            />
          </div>

          <!-- Error general -->
          <div 
            v-if="error" 
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {{ error }}
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <BaseButton
              type="submit"
              variant="primary"
              :loading="loading"
              :disabled="!selectedMember"
            >
              💰 Registrar Pago
            </BaseButton>

            <BaseButton
              type="button"
              variant="secondary"
              @click="resetForm"
              :disabled="loading"
            >
              Limpiar
            </BaseButton>
          </div>
        </form>
      </div>

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
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { usePayments } from '@/composables/usePayments'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const { plans, loading, error, getPlans, createPayment } = usePayments()

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
  await getPlans()
})
</script>

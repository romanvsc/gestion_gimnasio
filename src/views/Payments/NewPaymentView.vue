<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto px-4 py-6 md:py-8">
      
      <!-- Header con botón volver -->
      <div class="mb-6 md:mb-8">
        <BaseButton variant="ghost" @click="$router.back()" class="mb-4">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Volver
        </BaseButton>
        
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">Registrar Pago</h1>
        <p class="text-page-subtitle">Registra un nuevo pago de membresía</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- En móvil: Resumen arriba (sticky) -->
        <div class="lg:hidden mb-6 sticky top-0 z-10">
          <PaymentSummaryCard
            :monto="formData.monto"
            :plan-name="selectedPlanName"
            :fecha-inicio="formattedStartDate"
            :fecha-fin="formattedEndDate"
            :duracion="durationDays"
            :metodo-pago="paymentMethodLabel"
            :tarifa-badge="tarifaBadge"
            compact
          />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          <!-- Columna Izquierda: Formulario (3/5) -->
          <div class="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-6">
            <h2 class="text-lg font-semibold text-gray-900">Datos del Pago</h2>
            
            <!-- Buscar Socio -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Buscar Socio *
              </label>
              <BaseInput
                v-model="memberSearch"
                placeholder="Nombre, apellido o DNI..."
                class="text-base md:text-lg"
                @input="searchMembers"
              />
              
              <!-- Resultados de búsqueda -->
              <div v-if="memberSearchResults.length > 0" class="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                <button
                  v-for="member in memberSearchResults"
                  :key="member.id"
                  type="button"
                  class="w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 touch-manipulation"
                  @click="selectMember(member)"
                >
                  <p class="font-medium text-gray-900">{{ member.nombre }} {{ member.apellido }}</p>
                  <p class="text-sm text-gray-500">DNI: {{ member.dni }}</p>
                </button>
              </div>

              <!-- Socio seleccionado -->
              <div v-if="selectedMember" class="mt-3 bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div class="flex justify-between items-start gap-3">
                  <div class="flex-1">
                    <p class="font-semibold text-primary-900">{{ selectedMember.nombre }} {{ selectedMember.apellido }}</p>
                    <p class="text-sm text-primary-700">DNI: {{ selectedMember.dni }}</p>
                    <span v-if="selectedMember.es_socio_club" class="inline-flex items-center gap-1 mt-2 text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-1 rounded-full border border-yellow-300">
                      🏆 Socio Club
                    </span>
                  </div>
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    @click="clearMember"
                    class="flex-shrink-0"
                  >
                    ✕
                  </BaseButton>
                </div>
              </div>
            </div>

            <!-- Seleccionar Plan -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Plan *
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  v-for="plan in plans"
                  :key="plan.id"
                  type="button"
                  :class="[
                    'p-4 rounded-xl border-2 text-left transition-all touch-manipulation',
                    formData.plan_id === plan.id
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                  ]"
                  @click="selectPlan(plan)"
                >
                  <p class="font-semibold text-gray-900 mb-1">{{ plan.nombre }}</p>
                  <p class="text-sm text-gray-500 mb-2">{{ plan.dias_duracion }} días</p>
                  <div class="flex items-baseline gap-2">
                    <p class="text-xl md:text-2xl font-bold text-primary-600">
                      ${{ selectedMember?.es_socio_club ? (plan.precio_socio || plan.precio) : plan.precio }}
                    </p>
                    <p v-if="selectedMember?.es_socio_club && plan.precio_socio && plan.precio_socio !== plan.precio" class="text-sm text-gray-400 line-through">
                      ${{ plan.precio }}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Método de Pago -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Método de Pago *
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="method in paymentMethods"
                  :key="method.id"
                  type="button"
                  :class="[
                    'px-5 py-3 rounded-lg border-2 font-medium transition-all touch-manipulation',
                    formData.metodo_pago === method.nombre
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 active:bg-gray-50'
                  ]"
                  @click="formData.metodo_pago = method.nombre"
                >
                  {{ method.nombre }}
                </button>
              </div>
            </div>

            <!-- Fecha de Inicio -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <BaseInput
                v-model="formData.fecha_inicio"
                type="date"
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

            <!-- Botones (móvil) -->
            <div class="lg:hidden flex flex-col gap-3 pt-4">
              <BaseButton
                type="submit"
                variant="primary"
                size="lg"
                :disabled="!isFormValid || loading"
                :loading="loading"
                full-width
              >
                Registrar Pago
              </BaseButton>
              <BaseButton
                type="button"
                variant="outline"
                size="lg"
                :disabled="loading"
                full-width
                @click="resetForm"
              >
                Limpiar Formulario
              </BaseButton>
            </div>
          </div>

          <!-- Columna Derecha: Resumen (2/5) - Solo desktop -->
          <div class="hidden lg:block lg:col-span-2">
            <div class="sticky top-6 space-y-4">
              <PaymentSummaryCard
                :monto="formData.monto"
                :plan-name="selectedPlanName"
                :fecha-inicio="formattedStartDate"
                :fecha-fin="formattedEndDate"
                :duracion="durationDays"
                :metodo-pago="paymentMethodLabel"
                :tarifa-badge="tarifaBadge"
              />
              
              <!-- Botones (desktop) -->
              <div class="space-y-3">
                <BaseButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  :disabled="!isFormValid || loading"
                  :loading="loading"
                  full-width
                >
                  Registrar Pago
                </BaseButton>
                <BaseButton
                  type="button"
                  variant="outline"
                  size="lg"
                  :disabled="loading"
                  full-width
                  @click="resetForm"
                >
                  Limpiar Formulario
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Modal de éxito -->
      <SuccessModal
        v-model="showSuccessModal"
        title="¡Pago Registrado!"
        message="El pago se ha registrado exitosamente y la membresía ha sido actualizada."
        @close="closeSuccessModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowLeft } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { usePayments } from '@/composables/usePayments'
import { useParameters } from '@/composables/useParameters'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import PaymentSummaryCard from '@/components/payments/PaymentSummaryCard.vue'
import SuccessModal from '@/components/ui/SuccessModal.vue'

const router = useRouter()
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

// Computed properties
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

const tarifaBadge = computed(() => {
  if (!selectedMember.value || !formData.value.plan_id || !formData.value.monto) return null
  
  const isSocioClub = selectedMember.value.es_socio_club
  
  if (isSocioClub) {
    return {
      icon: '🏆',
      text: 'Tarifa Club',
      class: 'bg-yellow-100 text-yellow-800 border border-yellow-300'
    }
  } else {
    return {
      icon: '💳',
      text: 'Tarifa Estándar',
      class: 'bg-gray-100 text-gray-700 border border-gray-300'
    }
  }
})

const isFormValid = computed(() => {
  return selectedMember.value && 
         formData.value.plan_id && 
         formData.value.metodo_pago &&
         formData.value.fecha_inicio
})

// Métodos
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
        .from('v_socios_estado')
        .select('id, nombre, apellido, dni, es_socio_club, plan_id')
        .eq('activo', true)
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
  
  // Auto-seleccionar plan si el socio tiene uno asociado
  if (member.plan_id) {
    formData.value.plan_id = member.plan_id
    updateDates()
    toast.success(`Plan "${selectedPlanName.value}" seleccionado automáticamente`, { duration: 2000 })
  }
}

function clearMember() {
  selectedMember.value = null
  formData.value.member_id = ''
  memberSearch.value = ''
}

function selectPlan(plan) {
  formData.value.plan_id = plan.id
  updateDates()
}

function updateDates() {
  if (!formData.value.plan_id || !formData.value.fecha_inicio) return

  const plan = plans.value.find(p => p.id == formData.value.plan_id)
  if (!plan) return

  // Calcular monto según si es socio club o no
  if (selectedMember.value && selectedMember.value.es_socio_club) {
    formData.value.monto = plan.precio_socio || plan.precio
  } else {
    formData.value.monto = plan.precio
  }

  // Calcular fecha fin
  const startDate = new Date(formData.value.fecha_inicio)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + plan.dias_duracion)
  formData.value.fecha_fin = endDate.toISOString().split('T')[0]
}

async function handleSubmit() {
  if (!selectedMember.value) {
    toast.error('Por favor selecciona un socio', { duration: 3000 })
    return
  }
  
  if (!formData.value.plan_id) {
    toast.error('Por favor selecciona un plan', { duration: 3000 })
    return
  }

  const paymentPromise = createPayment(formData.value)
  
  toast.promise(paymentPromise, {
    loading: 'Registrando pago...',
    success: () => {
      showSuccessModal.value = true
      resetForm()
      return 'Pago registrado correctamente'
    },
    error: 'Error al registrar el pago'
  })
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

// Watcher para recalcular tarifa cuando cambia el plan o el socio
watch(
  () => formData.value.plan_id,
  () => {
    if (formData.value.plan_id && selectedMember.value) {
      updateDates()
    }
  }
)

onMounted(async () => {
  await fetchParameters()
})
</script>

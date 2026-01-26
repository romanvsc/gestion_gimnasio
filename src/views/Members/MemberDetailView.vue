<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header con Botón Volver -->
      <div class="mb-8">
        <BaseButton variant="ghost" @click="goBack">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Volver
        </BaseButton>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-6">
        <!-- Header Skeleton -->
        <BaseSkeleton height="12rem" rounded="xl" />
        
        <!-- Grid Cards Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BaseSkeleton height="10rem" rounded="lg" />
          <BaseSkeleton height="10rem" rounded="lg" />
          <BaseSkeleton height="10rem" rounded="lg" />
        </div>

        <!-- Personal Data Skeleton -->
        <BaseSkeleton height="16rem" rounded="xl" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Contenido -->
      <div v-else-if="memberData" class="space-y-6">
        <!-- Encabezado con Foto y Datos Principales -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-6 text-white">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
            <!-- Foto del Socio -->
            <div class="flex-shrink-0">
              <div v-if="memberData.foto_url" class="relative">
                <img
                  :src="memberData.foto_url"
                  :alt="`${memberData.nombre} ${memberData.apellido}`"
                  class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
              <div v-else class="w-24 h-24 rounded-full bg-white/20 border-4 border-white shadow-lg flex items-center justify-center">
                <span class="text-3xl font-bold text-white">
                  {{ getInitials(memberData.nombre, memberData.apellido) }}
                </span>
              </div>
            </div>

            <!-- Datos del Socio -->
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3">
                {{ memberData.nombre }} {{ memberData.apellido }}
                <span v-if="memberData.es_socio_club" 
                      class="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold"
                      title="Socio del Club">
                  <Star class="w-4 h-4 fill-yellow-900" />
                  Socio Club
                </span>
              </h1>
              <p class="text-white/90 text-lg mb-2">DNI: {{ memberData.dni }}</p>
              <div class="flex flex-wrap gap-2 justify-center md:justify-start">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-sm"
                  :class="memberData.activo ? 'bg-emerald-400 text-emerald-950' : 'bg-gray-600 text-gray-100'"
                >
                  {{ memberData.activo ? 'Activo' : 'Inactivo' }}
                </span>
                <span 
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white',
                    cuotaStatusInfo.badge
                  ]"
                >
                  {{ cuotaStatusInfo.label }}
                </span>
              </div>
            </div>

            <!-- Botón Editar -->
            <div class="flex-shrink-0">
              <button
                @click="goToEdit"
                class="px-6 py-2 bg-white text-primary-600 hover:bg-primary-50 font-semibold rounded-lg shadow-md transition-colors border-2 border-white"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </div>

        <!-- Grilla de Tarjetas de Información -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Tarjeta: Estado de Cuota -->
          <MemberStatusCard
            title="Estado de Cuota"
            :icon="CalendarCheck"
            :status="cuotaStatusInfo.status"
            :statusText="cuotaStatusInfo.description"
            :dateLabel="cuotaStatusInfo.dateLabel"
            :dateValue="memberData.fecha_fin_cuota"
          />

          <!-- Tarjeta: Apto Físico -->
          <MemberStatusCard
            title="Apto Físico"
            :icon="Heart"
            :status="aptoStatusInfo.status"
            :statusText="aptoStatusInfo.description"
            :dateLabel="aptoStatusInfo.dateLabel"
            :dateValue="memberData.apto_fisico"
          />

          <!-- Tarjeta: Salud (IMC) -->
          <div class="rounded-lg shadow-sm border-2 bg-primary-50 border-primary-200 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="p-2 rounded-lg bg-primary-100">
                <Activity class="w-6 h-6 text-primary-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Salud</h3>
            </div>
            
            <div v-if="memberData.peso && memberData.altura" class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 flex items-center gap-1">
                  <Weight class="w-4 h-4" /> Peso:
                </span>
                <span class="font-semibold text-gray-900">{{ memberData.peso }} kg</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 flex items-center gap-1">
                  <Ruler class="w-4 h-4" /> Altura:
                </span>
                <span class="font-semibold text-gray-900">{{ memberData.altura }} m</span>
              </div>
              <div class="pt-2 border-t border-primary-200">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">IMC:</span>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-primary-700 text-lg">{{ calculatedIMC }}</span>
                    <span :class="['inline-flex h-3 w-3 rounded-full', imcColor]"></span>
                  </div>
                </div>
                <p :class="['text-xs mt-1', imcTextColor]">
                  {{ imcCategory }}
                </p>
              </div>
            </div>
            
            <div v-else class="text-sm text-gray-500">
              Sin datos de salud registrados
            </div>
          </div>
        </div>

        <!-- Datos Personales -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User class="w-5 h-5" />
            Datos Personales
          </h2>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ memberData.email || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ memberData.telefono || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDateLong(memberData.fecha_nacimiento) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Alta</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDateLong(memberData.fecha_alta) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Plan Asignado</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ planName || 'Sin plan fijo' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Tipo de Membresía</dt>
              <dd class="mt-1 text-sm text-gray-900 flex items-center gap-2">
                {{ memberData.es_socio_club ? 'Socio del Club' : 'Socio Regular' }}
                <span v-if="memberData.es_socio_club" class="text-yellow-500">⭐</span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Historial de Pagos -->
        <MemberPaymentsHistory
          :payments="payments"
          :loading="loadingPayments"
          @new-payment="goToNewPayment"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useMembers } from '@/composables/useMembers'
import { useParameters } from '@/composables/useParameters'
import { formatDateLong } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'

import MemberStatusCard from '@/components/members/MemberStatusCard.vue'
import MemberPaymentsHistory from '@/components/members/MemberPaymentsHistory.vue'
import { 
  Star, User, CalendarCheck, Heart, Activity, Weight, 
  Ruler, ArrowLeft 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { loading, error, getMemberById } = useMembers()
const { plans, fetchParameters } = useParameters()

const memberData = ref(null)
const payments = ref([])
const loadingPayments = ref(false)

// Computed: Info del estado de cuota
const cuotaStatusInfo = computed(() => {
  if (!memberData.value) return {}
  
  const estado = memberData.value.estado_cuota
  
  if (estado === 'activo') {
    return {
      status: 'success',
      badge: 'bg-emerald-600',
      label: 'Cuota al día',
      description: 'El socio está al día',
      dateLabel: 'Vence'
    }
  } else if (estado === 'vencido') {
    return {
      status: 'danger',
      badge: 'bg-red-600',
      label: 'Cuota Vencida',
      description: 'Cuota vencida',
      dateLabel: 'Venció'
    }
  } else {
    return {
      status: 'default',
      badge: 'bg-gray-500',
      label: 'Sin pagos',
      description: 'Sin pagos registrados',
      dateLabel: ''
    }
  }
})

// Computed: Info del estado del apto físico 
const aptoStatusInfo = computed(() => {
  if (!memberData.value) return {}
  
  const estado = memberData.value.estado_apto_fisico
  
  if (estado === 'vigente') {
    return {
      status: 'info',
      description: 'Vigente',
      dateLabel: 'Vence'
    }
  } else if (estado === 'vencido') {
    return {
      status: 'warning',
      description: 'Apto físico vencido',
      dateLabel: 'Venció'
    }
  } else {
    return {
      status: 'default',
      description: 'Sin apto físico',
      dateLabel: ''
    }
  }
})

// Computed: Iniciales del socio
function getInitials(nombre, apellido) {
  const n = nombre?.charAt(0) || ''
  const a = apellido?.charAt(0) || ''
  return `${n}${a}`.toUpperCase()
}

// Computed: IMC Calculado
const calculatedIMC = computed(() => {
  if (!memberData.value?.peso || !memberData.value?.altura || memberData.value.altura === 0) {
    return '-'
  }
  const imc = memberData.value.peso / (memberData.value.altura * memberData.value.altura)
  return imc.toFixed(2)
})

const imcCategory = computed(() => {
  const imc = parseFloat(calculatedIMC.value)
  if (isNaN(imc)) return ''
  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25) return 'Peso normal'
  if (imc < 30) return 'Sobrepeso'
  return 'Obesidad'
})

const imcColor = computed(() => {
  const imc = parseFloat(calculatedIMC.value)
  if (isNaN(imc)) return 'bg-gray-300'
  if (imc < 18.5) return 'bg-yellow-400'
  if (imc < 25) return 'bg-green-500'
  if (imc < 30) return 'bg-orange-400'
  return 'bg-red-500'
})

const imcTextColor = computed(() => {
  const imc = parseFloat(calculatedIMC.value)
  if (isNaN(imc)) return 'text-gray-600'
  if (imc < 18.5) return 'text-yellow-700'
  if (imc < 25) return 'text-green-700'
  if (imc < 30) return 'text-orange-700'
  return 'text-red-700'
})

// Computed: Nombre del plan
const planName = computed(() => {
  if (!memberData.value?.plan_id) return null
  const plan = plans.value.find(p => p.id === memberData.value.plan_id)
  return plan ? plan.nombre : `Plan ID: ${memberData.value.plan_id}`
})

// Función: Cargar historial de pagos
async function loadPayments() {
  try {
    loadingPayments.value = true
    const { data, error: paymentError } = await supabase
      .from('payments')
      .select('*, plans(nombre)')
      .eq('member_id', route.params.id)
      .order('created_at', { ascending: false })

    if (paymentError) throw paymentError
    payments.value = data || []
  } catch (err) {
    console.error('Error al cargar historial de pagos:', err)
  } finally {
    loadingPayments.value = false
  }
}

// Navegación
function goBack() {
  router.push({ name: 'Members' })
}

function goToEdit() {
  router.push({ name: 'EditMember', params: { id: route.params.id } })
}

function goToNewPayment() {
  router.push({ name: 'NewPayment' })
}

// Lifecycle
onMounted(async () => {
  // Cargar parámetros (planes)
  await fetchParameters()
  
  // Cargar datos del socio
  const result = await getMemberById(route.params.id)
  if (result.success) {
    memberData.value = result.data
  }

  // Cargar historial de pagos
  await loadPayments()
})
</script>

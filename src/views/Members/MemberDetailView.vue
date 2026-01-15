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

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">Cargando datos del socio...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Contenido -->
      <div v-else-if="memberData" class="space-y-6">
        <!-- Encabezado con Foto y Datos Principales -->
        <div class="bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
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
                <StatusBadge 
                  :type="memberData.activo ? 'success' : 'secondary'"
                  class="bg-white/20 border-white/40"
                >
                  {{ memberData.activo ? 'Activo' : 'Inactivo' }}
                </StatusBadge>
                <span 
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white',
                    statusColors.badge
                  ]"
                >
                  {{ statusColors.label }}
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
          <div 
            :class="[
              'rounded-lg shadow-sm border-2 p-6',
              statusColors.card
            ]"
          >
            <div class="flex items-center gap-3 mb-3">
              <div :class="[
                'p-2 rounded-lg',
                statusColors.iconBg
              ]">
                <CalendarCheck :class="[
                  'w-6 h-6',
                  statusColors.icon
                ]" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Estado de Cuota</h3>
            </div>
            <p :class="[
              'text-sm font-medium',
              statusColors.text
            ]">
              {{ memberData.estado_cuota === 'activo' ? 'El socio está al día' : 
                 memberData.estado_cuota === 'vencido' ? 'Cuota vencida' :
                 'Sin pagos registrados' }}
            </p>
            <p v-if="memberData.fecha_fin_cuota" class="text-xs text-gray-600 mt-2">
              {{ memberData.estado_cuota === 'activo' ? 'Vence:' : 'Vence:' }} {{ formatDate(memberData.fecha_fin_cuota) }}
            </p>
          </div>

          <!-- Tarjeta: Apto Físico -->
          <div 
            :class="[
              'rounded-lg shadow-sm border-2 p-6',
              memberData.estado_apto_fisico === 'vencido' ? 'bg-yellow-50 border-yellow-300' : 
              memberData.estado_apto_fisico === 'vigente' ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200'
            ]"
          >
            <div class="flex items-center gap-3 mb-3">
              <div :class="[
                'p-2 rounded-lg',
                memberData.estado_apto_fisico === 'vencido' ? 'bg-yellow-100' : 
                memberData.estado_apto_fisico === 'vigente' ? 'bg-blue-100' :
                'bg-gray-100'
              ]">
                <Heart :class="[
                  'w-6 h-6',
                  memberData.estado_apto_fisico === 'vencido' ? 'text-yellow-700' : 
                  memberData.estado_apto_fisico === 'vigente' ? 'text-blue-600' :
                  'text-gray-600'
                ]" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Apto Físico</h3>
            </div>
            <p :class="[
              'text-sm font-medium',
              memberData.estado_apto_fisico === 'vencido' ? 'text-yellow-800' : 
              memberData.estado_apto_fisico === 'vigente' ? 'text-blue-700' :
              'text-gray-700'
            ]">
              {{ memberData.estado_apto_fisico === 'vigente' ? 'Vigente' : 
                 memberData.estado_apto_fisico === 'vencido' ? 'Apto físico vencido' :
                 'Sin apto físico' }}
            </p>
            <p v-if="memberData.apto_fisico" class="text-xs text-gray-600 mt-2">
              {{ memberData.estado_apto_fisico === 'vigente' ? 'Vence:' : 'Venció:' }} 
              {{ formatDate(memberData.apto_fisico) }}
            </p>
          </div>

          <!-- Tarjeta: Salud (IMC) -->
          <div class="rounded-lg shadow-sm border-2 bg-purple-50 border-purple-200 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="p-2 rounded-lg bg-purple-100">
                <Activity class="w-6 h-6 text-purple-600" />
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
              <div class="pt-2 border-t border-purple-200">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">IMC:</span>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-purple-700 text-lg">{{ calculatedIMC }}</span>
                    <span :class="[
                      'inline-flex h-3 w-3 rounded-full',
                      imcColor
                    ]"></span>
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
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(memberData.fecha_nacimiento) || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Alta</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(memberData.fecha_alta) || '-' }}</dd>
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
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <History class="w-5 h-5" />
              Historial de Pagos
            </h2>
            <BaseButton
              color="primary"
              size="sm"
              @click="goToNewPayment"
            >
              + Registrar Pago
            </BaseButton>
          </div>

          <!-- Loading de pagos -->
          <div v-if="loadingPayments" class="text-center py-8">
            <p class="text-gray-600">Cargando historial...</p>
          </div>

          <!-- Sin pagos -->
          <div v-else-if="payments.length === 0" class="text-center py-12 text-gray-500">
            <History class="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p class="text-lg font-medium">No hay pagos registrados</p>
            <p class="text-sm">Registra el primer pago para este socio</p>
          </div>

          <!-- Tabla de Pagos -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Pago
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="payment in payments" 
                  :key="payment.id"
                  :class="[
                    'hover:bg-gray-50 transition-colors',
                    isPaymentExpired(payment.fecha_fin) && 'opacity-60'
                  ]"
                >
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(payment.created_at) }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ payment.plans?.nombre || getPlanName(payment.plan_id) }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ formatDate(payment.fecha_inicio) }} - {{ formatDate(payment.fecha_fin) }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <span class="text-sm font-semibold text-emerald-600">
                      ${{ payment.monto }}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ payment.metodo_pago }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Total de Pagos -->
            <div class="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span class="text-sm text-gray-600">
                Total de pagos: <span class="font-semibold">{{ payments.length }}</span>
              </span>
              <span class="text-lg font-bold text-gray-900">
                Total recaudado: <span class="text-emerald-600">${{ totalAmount }}</span>
              </span>
            </div>
          </div>
        </div>
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
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { 
  Star, User, CalendarCheck, Heart, Activity, Weight, 
  Ruler, History, ArrowLeft 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { loading, error, getMemberById } = useMembers()
const { plans, fetchParameters } = useParameters()

const memberData = ref(null)
const payments = ref([])
const loadingPayments = ref(false)

// Computed: Colores dinámicos según estado de cuota
const statusColors = computed(() => {
  if (!memberData.value) return {}
  
  const estado = memberData.value.estado_cuota
  
  if (estado === 'activo') {
    return {
      card: 'bg-emerald-50 border-emerald-200',
      iconBg: 'bg-emerald-100',
      icon: 'text-emerald-700',
      text: 'text-emerald-700',
      badge: 'bg-emerald-600',
      label: 'Cuota al día'
    }
  } else if (estado === 'vencido') {
    return {
      card: 'bg-red-50 border-red-300',
      iconBg: 'bg-red-100',
      icon: 'text-red-700',
      text: 'text-red-700',
      badge: 'bg-red-600',
      label: 'Cuota Vencida'
    }
  } else {
    // sin_pago o cualquier otro estado
    return {
      card: 'bg-gray-50 border-gray-200',
      iconBg: 'bg-gray-100',
      icon: 'text-gray-700',
      text: 'text-gray-700',
      badge: 'bg-gray-500',
      label: 'Sin pagos'
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

// Computed: Total de pagos
const totalAmount = computed(() => {
  return payments.value.reduce((sum, payment) => sum + parseFloat(payment.monto || 0), 0)
})

// Función: Formatear fecha
function formatDate(dateString) {
  if (!dateString) return '-'
  try {
    // Manejar tanto fechas ISO completas (con hora) como fechas simples
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  } catch (err) {
    console.error('Error formateando fecha:', err)
    return '-'
  }
}

// Función: Verificar si un pago está expirado
function isPaymentExpired(fechaFin) {
  if (!fechaFin) return false
  const today = new Date()
  const endDate = new Date(fechaFin + 'T00:00:00')
  return endDate < today
}

// Función: Obtener nombre del plan por ID o desde el JOIN
function getPlanName(planId, planObject) {
  // Si viene el objeto del JOIN, usarlo
  if (planObject?.nombre) return planObject.nombre
  // Si no, buscar en el array de planes
  if (!planId) return '-'
  const plan = plans.value.find(p => p.id === planId)
  return plan ? plan.nombre : `Plan ${planId}`
}

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

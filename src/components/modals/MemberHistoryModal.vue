<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-800">
          Historial de {{ memberName }}
        </h3>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button
            @click="activeTab = 'payments'"
            :class="[
              'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'payments'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <Receipt class="w-4 h-4" />
            Pagos
          </button>
          <button
            @click="activeTab = 'attendance'"
            :class="[
              'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'attendance'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <CalendarClock class="w-4 h-4" />
            Asistencias
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
          <p class="mt-4 text-gray-500">Cargando datos...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Payments Tab -->
        <div v-else-if="activeTab === 'payments'">
          <div v-if="payments.length > 0" class="space-y-3">
            <div
              v-for="payment in payments"
              :key="payment.id"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <Receipt class="w-5 h-5 text-primary-600" />
                    <h4 class="font-semibold text-gray-900">{{ payment.plans?.nombre || 'Plan no disponible' }}</h4>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-gray-500">Fecha Inicio:</span>
                      <span class="ml-2 text-gray-900">{{ formatDate(payment.fecha_inicio) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Fecha Fin:</span>
                      <span class="ml-2 text-gray-900">{{ formatDate(payment.fecha_fin) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Método:</span>
                      <span class="ml-2 text-gray-900">{{ payment.metodo_pago || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Monto:</span>
                      <span class="ml-2 font-semibold text-primary-600">{{ formatCurrency(payment.monto) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <Receipt class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">No hay pagos registrados</p>
          </div>
        </div>

        <!-- Attendance Tab -->
        <div v-else-if="activeTab === 'attendance'">
          <div v-if="attendances.length > 0" class="space-y-2">
            <div
              v-for="att in attendances"
              :key="att.id"
              class="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <CalendarClock class="w-5 h-5 text-primary-600" />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ formatDateTime(att.created_at) }}</p>
                </div>
              </div>
              <StatusBadge
                :status="att.acceso_permitido ? 'activo' : 'vencido'"
                :label="att.acceso_permitido ? 'Permitido' : 'Denegado'"
              />
            </div>
          </div>
          <div v-else class="text-center py-12">
            <CalendarClock class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">No hay asistencias registradas</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { X, Receipt, CalendarClock } from 'lucide-vue-next'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const props = defineProps({
  memberId: {
    type: String,
    required: true
  },
  memberName: {
    type: String,
    default: 'Socio'
  }
})

defineEmits(['close'])

const activeTab = ref('payments')
const payments = ref([])
const attendances = ref([])
const loading = ref(false)
const error = ref(null)

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
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

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(amount)
}

async function loadPayments() {
  try {
    const { data, error: fetchError } = await supabase
      .from('payments')
      .select('*, plans(nombre)')
      .eq('member_id', props.memberId)
      .order('fecha_inicio', { ascending: false })

    if (fetchError) throw fetchError

    payments.value = data || []
  } catch (err) {
    console.error('Error cargando pagos:', err)
  }
}

async function loadAttendances() {
  try {
    const { data, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('member_id', props.memberId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (fetchError) throw fetchError

    attendances.value = data || []
  } catch (err) {
    console.error('Error cargando asistencias:', err)
  }
}

async function loadData() {
  try {
    loading.value = true
    error.value = null

    await Promise.all([
      loadPayments(),
      loadAttendances()
    ])
  } catch (err) {
    console.error('Error cargando datos:', err)
    error.value = 'Error al cargar el historial'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

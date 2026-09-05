<template>
  <BaseModal
    :model-value="true"
    :title="'Historial de ' + memberName"
    size="lg"
    :max-body-height="'calc(100dvh - var(--mobile-nav-height) - 5rem)'"
    @close="$emit('close')"
  >

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex -mb-px" role="tablist" aria-label="Secciones del historial">
          <button
            type="button"
            id="payment-history-tab"
            role="tab"
            @click="activeTab = 'payments'"
            :aria-selected="activeTab === 'payments'"
            aria-controls="payment-history-panel"
            :class="[
              'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'payments'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <Receipt class="w-4 h-4" />
            Pagos
          </button>
          <button
            type="button"
            id="attendance-history-tab"
            role="tab"
            @click="activeTab = 'attendance'"
            :aria-selected="activeTab === 'attendance'"
            aria-controls="attendance-history-panel"
            :class="[
              'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'attendance'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <CalendarClock class="w-4 h-4" />
            Asistencias
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="max-h-[calc(100dvh-var(--mobile-nav-height)-10rem)] overflow-y-auto p-4 sm:max-h-[calc(80vh-160px)] sm:p-6">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-8" role="status" aria-live="polite">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-700 border-t-primary-600"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">Cargando datos...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" role="alert" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Payments Tab -->
        <div
          v-else-if="activeTab === 'payments'"
          id="payment-history-panel"
          role="tabpanel"
          aria-labelledby="payment-history-tab"
          tabindex="0"
        >
          <div v-if="payments.length > 0" class="space-y-3">
            <div
              v-for="payment in payments"
              :key="payment.id"
              class="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <Receipt class="w-5 h-5 text-primary-600" />
                    <h4 class="font-semibold text-page-title">{{ payment.plan_nombre || 'Plan no disponible' }}</h4>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Fecha Inicio:</span>
                      <span class="ml-2 text-page-title">{{ formatDate(payment.fecha_inicio) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Fecha Fin:</span>
                      <span class="ml-2 text-page-title">{{ formatDate(payment.fecha_fin) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Método:</span>
                      <span class="ml-2 text-page-title">{{ payment.metodo_pago || '-' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Monto:</span>
                      <span class="ml-2 font-semibold text-primary-600">{{ formatCurrencyFull(payment.monto) }}</span>
                    </div>
                  </div>
                  <div v-if="isAdmin" class="mt-4 flex justify-end">
                    <BaseButton
                      variant="outline"
                      size="sm"
                      :aria-label="`Corregir monto del pago del ${formatDate(payment.fecha_inicio)}`"
                      @click="startAdjustment(payment)"
                    >
                      Corregir monto
                    </BaseButton>
                  </div>
                </div>
              </div>

              <div
                v-if="adjustingPaymentId === payment.id"
                class="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20"
              >
                <div class="mb-3">
                  <h5 class="font-semibold text-page-title">Corrección administrativa</h5>
                  <p class="mt-1 text-sm text-page-muted">
                    El importe actual es {{ formatCurrencyFull(payment.monto) }}. La corrección actualiza también Caja y deja una auditoría.
                  </p>
                </div>

                <BaseInput
                  id="payment-adjustment-amount"
                  v-model="adjustmentForm.amount"
                  type="number"
                  label="Nuevo importe"
                  min="0.01"
                  step="0.01"
                  required
                  :disabled="adjustmentLoading"
                  :error="adjustmentFieldError"
                />

                <div class="mt-3">
                  <label for="payment-adjustment-reason" class="block text-sm font-medium text-page-title">
                    Motivo de la corrección <span class="text-danger-600">*</span>
                  </label>
                  <textarea
                    id="payment-adjustment-reason"
                    v-model="adjustmentForm.reason"
                    rows="3"
                    minlength="10"
                    maxlength="500"
                    required
                    :disabled="adjustmentLoading"
                    aria-describedby="payment-adjustment-reason-hint"
                    class="mt-1 block w-full rounded-lg border border-page-border bg-page-card px-3 py-2 text-sm text-page-title shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <p id="payment-adjustment-reason-hint" class="mt-1 text-xs text-page-muted">
                    Mínimo 10 caracteres. Este motivo queda guardado en la auditoría.
                  </p>
                </div>

                <p v-if="adjustmentError" role="alert" class="mt-3 text-sm font-medium text-danger-700 dark:text-danger-300">
                  {{ adjustmentError }}
                </p>

                <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <BaseButton variant="ghost" :disabled="adjustmentLoading" @click="cancelAdjustment">
                    Cancelar
                  </BaseButton>
                  <BaseButton :loading="adjustmentLoading" @click="requestAdjustment">
                    Revisar corrección
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <Receipt class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">No hay pagos registrados</p>
          </div>
        </div>

        <!-- Attendance Tab -->
        <div
          v-else-if="activeTab === 'attendance'"
          id="attendance-history-panel"
          role="tabpanel"
          aria-labelledby="attendance-history-tab"
          tabindex="0"
        >
          <div v-if="attendances.length > 0" class="space-y-2">
            <div
              v-for="att in attendances"
              :key="att.id"
              class="bg-gray-50 dark:bg-white/5 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <CalendarClock class="w-5 h-5 text-primary-600" />
                <div>
                  <p class="text-sm font-medium text-page-title">{{ formatDateTime(att.created_at) }}</p>
                </div>
              </div>
              <StatusBadge
                :status="att.acceso_permitido ? 'activo' : 'vencido'"
                :label="att.acceso_permitido ? 'Permitido' : 'Denegado'"
              />
            </div>
          </div>
          <div v-else class="text-center py-12">
            <CalendarClock class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">No hay asistencias registradas</p>
          </div>
        </div>
      </div>
  </BaseModal>

  <BaseConfirmDialog
    v-model="showAdjustmentConfirm"
    title="Confirmar corrección de pago"
    type="warning"
    confirm-text="Aplicar corrección"
    cancel-text="Volver"
    :message="adjustmentConfirmationMessage"
    :loading="adjustmentLoading"
    @confirm="applyAdjustment"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Receipt, CalendarClock } from 'lucide-vue-next'
import { formatDate, formatDateTime, formatCurrencyFull } from '@/utils/formatters'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import { billingCash } from '@/contexts/billing-cash'
import { useUserStore } from '@/stores/userStore'
import { toast } from 'vue-sonner'
import { useAttendance } from '@/composables/useAttendance'
import { reportClientError } from '@/lib/observability'

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
const adjustingPaymentId = ref(null)
const showAdjustmentConfirm = ref(false)
const adjustmentLoading = ref(false)
const adjustmentError = ref('')
const adjustmentFieldError = ref('')
const adjustmentForm = ref({ amount: '', reason: '' })
const userStore = useUserStore()
const { isAdmin } = storeToRefs(userStore)
const { listMemberAttendances } = useAttendance()
const adjustmentConfirmationMessage = ref('')

const adjustmentPayment = () => payments.value.find(payment => payment.id === adjustingPaymentId.value)

async function loadPayments() {
  try {
    payments.value = await billingCash.listMemberPayments(props.memberId)
  } catch (err) {
    reportClientError('member_history.payments_fetch', err)
    throw err
  }
}

async function loadAttendances() {
  try {
    attendances.value = await listMemberAttendances(props.memberId, 50)
  } catch (err) {
    reportClientError('member_history.attendance_fetch', err)
    throw err
  }
}

function startAdjustment(payment) {
  adjustingPaymentId.value = payment.id
  adjustmentForm.value = {
    amount: String(payment.monto),
    reason: ''
  }
  adjustmentError.value = ''
  adjustmentFieldError.value = ''
}

function cancelAdjustment() {
  adjustingPaymentId.value = null
  adjustmentForm.value = { amount: '', reason: '' }
  adjustmentError.value = ''
  adjustmentFieldError.value = ''
  showAdjustmentConfirm.value = false
}

function requestAdjustment() {
  const payment = adjustmentPayment()
  const amount = Number(adjustmentForm.value.amount)
  const reason = adjustmentForm.value.reason.trim()

  adjustmentFieldError.value = ''
  adjustmentError.value = ''

  if (!payment) {
    adjustmentError.value = 'Selecciona un pago para corregir.'
    return
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount === Number(payment.monto)) {
    adjustmentFieldError.value = 'Ingresa un importe positivo y diferente al actual.'
    return
  }

  if (reason.length < 10) {
    adjustmentError.value = 'El motivo debe tener al menos 10 caracteres.'
    return
  }

  adjustmentConfirmationMessage.value = `Se cambiará ${formatCurrencyFull(payment.monto)} por ${formatCurrencyFull(amount)}. También se actualizará el movimiento de Caja asociado y se guardará el motivo para auditoría.`
  showAdjustmentConfirm.value = true
}

async function applyAdjustment() {
  const payment = adjustmentPayment()
  if (!payment) return

  adjustmentLoading.value = true
  adjustmentError.value = ''

  try {
    await billingCash.adjustPaymentSnapshot({
      payment_id: payment.id,
      monto_nuevo: Number(adjustmentForm.value.amount),
      motivo: adjustmentForm.value.reason
    })

    await loadPayments()
    toast.success('Pago corregido y auditado correctamente')
    cancelAdjustment()
  } catch (err) {
    showAdjustmentConfirm.value = false
    adjustmentError.value = err?.message || 'No se pudo corregir el pago.'
  } finally {
    adjustmentLoading.value = false
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
    reportClientError('member_history.fetch', err)
    error.value = 'Error al cargar el historial'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

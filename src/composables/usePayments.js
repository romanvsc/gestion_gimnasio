import { ref } from 'vue'
import { planCatalog } from '@/contexts/plans-catalog'
import { billingCash } from '@/contexts/billing-cash'
import { reportClientError } from '@/lib/observability'
import { toUserMessage } from '@/lib/userFacingError'

export function usePayments() {
  const payments = ref([])
  const plans = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Obtiene todos los planes disponibles
   */
  async function getPlans() {
    try {
      loading.value = true
      error.value = null

      const data = (await planCatalog.listActive())
        .sort((first, second) => Number(first.precio) - Number(second.precio))

      plans.value = data || []
      return { success: true, data }
    } catch (err) {
      reportClientError('billing.plans_fetch', err)
      const message = toUserMessage(err)
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo pago
   */
  async function createPayment(paymentData, options = {}) {
    try {
      loading.value = true
      error.value = null

      const data = await billingCash.registerPayment(paymentData, options)

      return { success: true, data }
    } catch (err) {
      reportClientError('billing.payment_create', err)
      const message = toUserMessage(err)
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene pagos de un socio
   */
  async function getMemberPayments(memberId) {
    try {
      loading.value = true
      error.value = null

      const data = await billingCash.listMemberPayments(memberId)

      payments.value = data || []
      return { success: true, data }
    } catch (err) {
      reportClientError('billing.payments_fetch', err)
      const message = toUserMessage(err)
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpia los errores
   */
  function clearError() {
    error.value = null
  }

  return {
    // Estado
    payments,
    plans,
    loading,
    error,
    // Métodos
    getPlans,
    createPayment,
    getMemberPayments,
    clearError
  }
}

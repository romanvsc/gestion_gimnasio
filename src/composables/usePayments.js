import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

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

      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('activo', true)
        .order('precio', { ascending: true })

      if (fetchError) throw fetchError

      plans.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener planes:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo pago
   */
  async function createPayment(paymentData) {
    try {
      loading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single()

      if (createError) throw createError

      return { success: true, data }
    } catch (err) {
      console.error('Error al crear pago:', err)
      error.value = err.message
      return { success: false, error: err.message }
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

      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          plans (
            nombre,
            precio,
            dias_duracion
          )
        `)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      payments.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener pagos:', err)
      error.value = err.message
      return { success: false, error: err.message }
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
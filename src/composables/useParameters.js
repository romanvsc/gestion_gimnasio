import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { runQuery } from '@/lib/asyncHandler'

export function useParameters() {
  const concepts = ref([])
  const plans = ref([])
  const paymentMethods = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Carga conceptos, planes y métodos de pago activos desde Supabase
   */
  async function fetchParameters() {
    try {
      loading.value = true
      error.value = null

      // Usar runQuery en paralelo con Promise.all
      const [conceptsData, plansData, paymentMethodsData] = await Promise.all([
        // Cargar conceptos activos
        runQuery(() =>
          supabase
            .from('concepts')
            .select('*')
            .eq('activo', true)
            .order('nombre')
        ),
        
        // Cargar planes activos
        runQuery(() =>
          supabase
            .from('plans')
            .select('id, nombre, dias_duracion, precio, precio_socio, activo')
            .eq('activo', true)
            .order('nombre')
        ),
        
        // Cargar métodos de pago activos
        runQuery(() =>
          supabase
            .from('payment_methods')
            .select('*')
            .eq('activo', true)
            .order('nombre')
        )
      ])

      concepts.value = conceptsData || []
      plans.value = plansData || []
      paymentMethods.value = paymentMethodsData || []

      return { success: true }
    } catch (err) {
      console.error('Error cargando parámetros:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Filtra conceptos por tipo
   * @param {string} type - 'INGRESO' o 'EGRESO'
   * @returns {Array} Conceptos filtrados
   */
  function getConceptsByType(type) {
    if (!type) return []
    
    return concepts.value.filter(concept => 
      concept.tipo === type || concept.tipo === 'AMBOS'
    )
  }

  /**
   * Carga TODOS los planes (activos e inactivos) para gestión
   */
  async function fetchAllPlans() {
    try {
      const data = await runQuery(() =>
        supabase
          .from('plans')
          .select('id, nombre, dias_duracion, precio, precio_socio, activo')
          .order('nombre')
      )
      plans.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error cargando planes:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Carga TODOS los métodos de pago para gestión
   */
  async function fetchAllPaymentMethods() {
    try {
      const data = await runQuery(() =>
        supabase
          .from('payment_methods')
          .select('*')
          .order('nombre')
      )
      paymentMethods.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error cargando métodos de pago:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Crea un nuevo plan
   */
  async function createPlan(planData) {
    try {
      const data = await runQuery(() =>
        supabase
          .from('plans')
          .insert([planData])
          .select()
          .single()
      )
      return { success: true, data }
    } catch (err) {
      console.error('Error creando plan:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Actualiza un plan existente
   */
  async function updatePlan(id, planData) {
    try {
      const data = await runQuery(() =>
        supabase
          .from('plans')
          .update(planData)
          .eq('id', id)
          .select()
          .single()
      )
      return { success: true, data }
    } catch (err) {
      console.error('Error actualizando plan:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Actualiza un método de pago
   */
  async function updatePaymentMethod(id, methodData) {
    try {
      const data = await runQuery(() =>
        supabase
          .from('payment_methods')
          .update(methodData)
          .eq('id', id)
          .select()
          .single()
      )
      return { success: true, data }
    } catch (err) {
      console.error('Error actualizando método de pago:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Obtiene conceptos para INGRESOS (computed)
   */
  const incomeConcepts = computed(() => getConceptsByType('INGRESO'))

  /**
   * Obtiene conceptos para EGRESOS (computed)
   */
  const expenseConcepts = computed(() => getConceptsByType('EGRESO'))

  function clearError() {
    error.value = null
  }

  return {
    // Estado
    concepts,
    plans,
    paymentMethods,
    loading,
    error,
    // Computed
    incomeConcepts,
    expenseConcepts,
    // Métodos
    fetchParameters,
    fetchAllPlans,
    fetchAllPaymentMethods,
    createPlan,
    updatePlan,
    updatePaymentMethod,
    getConceptsByType,
    clearError
  }
}

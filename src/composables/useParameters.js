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
    getConceptsByType,
    clearError
  }
}

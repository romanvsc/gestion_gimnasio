import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export function useParameters() {
  const concepts = ref([])
  const plans = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Carga conceptos y planes activos desde Supabase
   */
  async function fetchParameters() {
    try {
      loading.value = true
      error.value = null

      const [conceptsResponse, plansResponse] = await Promise.all([
        // Cargar conceptos activos
        supabase
          .from('concepts')
          .select('*')
          .eq('activo', true)
          .order('nombre'),
        
        // Cargar planes activos
        supabase
          .from('plans')
          .select('*')
          .eq('activo', true)
          .order('nombre')
      ])

      if (conceptsResponse.error) throw conceptsResponse.error
      if (plansResponse.error) throw plansResponse.error

      concepts.value = conceptsResponse.data || []
      plans.value = plansResponse.data || []

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

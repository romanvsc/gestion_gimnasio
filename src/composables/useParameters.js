import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { runQuery } from '@/lib/asyncHandler'
import { reportClientError } from '@/lib/observability'
import { planCatalog } from '@/contexts/plans-catalog'
import { toUserMessage } from '@/lib/userFacingError'

function parseOptionalPrice(value) {
  return value === null || value === undefined || value === ''
    ? null
    : parseFloat(value)
}

export function useParameters() {
  const concepts = ref([])
  const plans = ref([])
  const paymentMethods = ref([])
  const memberPageSizes = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Carga tamaños de pagina para listado de socios desde DB.
   * Si la tabla no existe todavia, no rompe la carga general de parametros.
   */
  async function fetchMemberPageSizes() {
    try {
      const data = await runQuery(() =>
        supabase
          .from('member_page_sizes')
          .select('id, value, label, sort_order, activo')
          .eq('activo', true)
          .order('sort_order', { ascending: true })
          .order('value', { ascending: true }),
        0
      )

      memberPageSizes.value = (data || []).map(item => ({
        ...item,
        value: Number(item.value)
      }))

      return { success: true, data: memberPageSizes.value }
    } catch (err) {
      reportClientError('parameters.member_page_sizes', err)
      memberPageSizes.value = []
      return { success: false, error: toUserMessage(err) }
    }
  }

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
            .select('id, nombre, tipo, activo')
            .eq('activo', true)
            .order('nombre')
        ),

        // Cargar planes activos mediante el contexto Plans & Catalog
        planCatalog.listActive(),

        // Cargar métodos de pago activos
        runQuery(() =>
          supabase
            .from('payment_methods')
            .select('id, nombre, activo')
            .eq('activo', true)
            .order('nombre')
        )
      ])

      concepts.value = conceptsData || []
      plans.value = plansData || []
      paymentMethods.value = paymentMethodsData || []

      // No bloquear la carga principal si la tabla opcional aun no existe
      await fetchMemberPageSizes()

      return { success: true }
    } catch (err) {
      reportClientError('parameters.fetch', err)
      const message = toUserMessage(err)
      error.value = message
      return { success: false, error: message }
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
      const data = await planCatalog.listAll()
      plans.value = data || []
      return { success: true, data }
    } catch (err) {
      reportClientError('parameters.fetch_plans', err)
      return { success: false, error: toUserMessage(err) }
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
          .select('id, nombre, activo')
          .order('nombre')
      )
      paymentMethods.value = data || []
      return { success: true, data }
    } catch (err) {
      reportClientError('parameters.fetch_payment_methods', err)
      return { success: false, error: toUserMessage(err) }
    }
  }

  /**
   * Crea un nuevo plan
   */
  async function createPlan(planData) {
    try {
      // Limpiar datos antes de enviar
      const cleanData = {
        nombre: planData.nombre?.trim(),
        dias_duracion: parseInt(planData.dias_duracion, 10),
        precio: parseFloat(planData.precio),
        precio_socio: parseOptionalPrice(planData.precio_socio),
        activo: planData.activo !== false
      }

      const data = await planCatalog.create(cleanData)
      return { success: true, data }
    } catch (err) {
      reportClientError('parameters.create_plan', err)

      // Traducir errores de Postgres
      let friendlyError = toUserMessage(err)
      if (err.code === '23505') friendlyError = 'Ya existe un plan con ese nombre. Elegí otro nombre.'
      if (err.code === '23502') friendlyError = 'Completá los datos obligatorios del plan.'
      return { success: false, error: friendlyError }
    }
  }

  /**
   * Actualiza un plan existente
   */
  async function updatePlan(id, planData) {
    try {
      // Limpiar datos antes de enviar
      const cleanData = {
        nombre: planData.nombre?.trim(),
        dias_duracion: parseInt(planData.dias_duracion, 10),
        precio: parseFloat(planData.precio),
        precio_socio: parseOptionalPrice(planData.precio_socio),
        activo: planData.activo !== false
      }

      const data = await planCatalog.update(id, cleanData)
      return { success: true, data }
    } catch (err) {
      reportClientError('parameters.update_plan', err)

      let friendlyError = toUserMessage(err)
      if (err.code === '23505') friendlyError = 'Ya existe un plan con ese nombre. Elegí otro nombre.'
      return { success: false, error: friendlyError }
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
          .select('id, nombre, activo')
          .single()
      )
      return { success: true, data }
    } catch (err) {
      reportClientError('parameters.update_payment_method', err)
      return { success: false, error: toUserMessage(err) }
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
    memberPageSizes,
    loading,
    error,
    // Computed
    incomeConcepts,
    expenseConcepts,
    // Métodos
    fetchParameters,
    fetchMemberPageSizes,
    fetchAllPlans,
    fetchAllPaymentMethods,
    createPlan,
    updatePlan,
    updatePaymentMethod,
    getConceptsByType,
    clearError
  }
}

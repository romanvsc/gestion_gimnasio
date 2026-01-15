import { ref, reactive } from 'vue'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export function useReports() {
  const financeData = ref([])
  const dailyData = ref([])
  const hourlyData = ref([])
  const overdueMembers = ref([])
  const inactiveMembers = ref([])
  
  const loading = reactive({
    finance: false,
    daily: false,
    hourly: false,
    overdue: false,
    inactive: false
  })
  
  const error = ref(null)

  /**
   * Obtiene estadísticas financieras de los últimos 12 meses
   * Retorna: { mes, ingresos, egresos }
   */
  async function fetchFinanceStats() {
    try {
      loading.finance = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('get_monthly_finance_stats')

      if (rpcError) throw rpcError

      financeData.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener estadísticas financieras:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.finance = false
    }
  }

  /**
   * Obtiene actividad por día de la semana (últimos 30 días)
   * Retorna: { dia_semana, cantidad }
   */
  async function fetchDailyActivity() {
    try {
      loading.daily = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('get_daily_activity_stats')

      if (rpcError) throw rpcError

      dailyData.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener actividad diaria:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.daily = false
    }
  }

  /**
   * Obtiene actividad por hora del día (últimos 30 días)
   * Retorna: { hora, cantidad }
   */
  async function fetchHourlyActivity() {
    try {
      loading.hourly = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('get_hourly_activity_stats')

      if (rpcError) throw rpcError

      hourlyData.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener actividad horaria:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.hourly = false
    }
  }

  /**
   * Obtiene socios con cuota vencida
   */
  async function fetchOverdueMembers() {
    try {
      loading.overdue = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('v_socios_estado')
        .select('*')
        .eq('estado_cuota', 'vencido')
        .eq('activo', true)
        .order('apellido', { ascending: true })

      if (fetchError) throw fetchError

      overdueMembers.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener socios vencidos:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.overdue = false
    }
  }

  /**
   * Obtiene socios inactivos
   */
  async function fetchInactiveMembers() {
    try {
      loading.inactive = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('members')
        .select('id, nombre, apellido, dni, email, telefono, fecha_alta, fecha_baja')
        .eq('activo', false)
        .order('apellido', { ascending: true })

      if (fetchError) throw fetchError

      inactiveMembers.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener socios inactivos:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.inactive = false
    }
  }

  /**
   * Exporta datos a Excel
   * @param {Array} data - Datos a exportar
   * @param {String} filename - Nombre del archivo (sin extensión)
   */
  function exportToExcel(data, filename = 'reporte') {
    try {
      if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar')
      }

      // Crear worksheet desde los datos
      const worksheet = XLSX.utils.json_to_sheet(data)

      // Crear workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')

      // Generar archivo y descargar
      const today = new Date().toISOString().split('T')[0]
      const fullFilename = `${filename}-${today}.xlsx`
      XLSX.writeFile(workbook, fullFilename)

      return { success: true }
    } catch (err) {
      console.error('Error al exportar Excel:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Formatea datos de socios vencidos para Excel
   */
  function formatOverdueForExcel() {
    return overdueMembers.value.map(member => ({
      'DNI': member.dni,
      'Apellido': member.apellido,
      'Nombre': member.nombre,
      'Email': member.email || '',
      'Teléfono': member.telefono || '',
      'Fecha Vencimiento': member.fecha_fin_cuota || '',
      'Días Vencido': member.dias_vencido || 0
    }))
  }

  /**
   * Formatea datos de socios inactivos para Excel
   */
  function formatInactiveForExcel() {
    return inactiveMembers.value.map(member => ({
      'DNI': member.dni,
      'Apellido': member.apellido,
      'Nombre': member.nombre,
      'Email': member.email || '',
      'Teléfono': member.telefono || '',
      'Fecha Alta': member.fecha_alta || '',
      'Fecha Baja': member.fecha_baja || ''
    }))
  }

  /**
   * Exporta socios vencidos a Excel
   */
  function exportOverdueMembers() {
    const formattedData = formatOverdueForExcel()
    return exportToExcel(formattedData, 'socios-vencidos')
  }

  /**
   * Exporta socios inactivos a Excel
   */
  function exportInactiveMembers() {
    const formattedData = formatInactiveForExcel()
    return exportToExcel(formattedData, 'socios-inactivos')
  }

  return {
    // Estado
    financeData,
    dailyData,
    hourlyData,
    overdueMembers,
    inactiveMembers,
    loading,
    error,
    
    // Métodos de fetch
    fetchFinanceStats,
    fetchDailyActivity,
    fetchHourlyActivity,
    fetchOverdueMembers,
    fetchInactiveMembers,
    
    // Métodos de exportación
    exportToExcel,
    exportOverdueMembers,
    exportInactiveMembers
  }
}

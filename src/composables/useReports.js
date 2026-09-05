import { ref, reactive } from 'vue'
import { supabase } from '@/lib/supabase'
import { reportClientError } from '@/lib/observability'
import { downloadExcelWorkbook, objectsToExcelRows } from '@/utils/excelExport'

const OVERDUE_MEMBER_FIELDS = 'id, nombre, apellido, dni, email, telefono, fecha_fin_cuota, dias_vencido, activo, estado_cuota, estado_apto_fisico, es_socio_club, plan_id, foto_url'
const REVENUE_FIELDS = 'created_at, monto'
const ATTENDANCE_ACTIVITY_FIELDS = 'created_at'

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
   * Obtiene estadísticas financieras en un rango de fechas
   * @param {String} startDate - Fecha de inicio (ISO string)
   * @param {String} endDate - Fecha de fin (ISO string)
   * Retorna: { mes, ingresos, egresos }
   */
  async function fetchFinanceStats(startDate = null, endDate = null) {
    try {
      loading.finance = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('get_monthly_finance_stats', {
          fecha_inicio: startDate,
          fecha_fin: endDate
        })

      if (rpcError) throw rpcError

      financeData.value = data || []
      return { success: true, data }
    } catch (err) {
      reportClientError('reports.finance', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.finance = false
    }
  }

  /**
   * Obtiene actividad por día de la semana en un rango de fechas
   * @param {String} startDate - Fecha de inicio (ISO string)
   * @param {String} endDate - Fecha de fin (ISO string)
   * Retorna: { dia_semana, cantidad }
   */
  async function fetchDailyActivity(startDate = null, endDate = null) {
    try {
      loading.daily = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('get_daily_activity_stats', {
          fecha_inicio: startDate,
          fecha_fin: endDate
        })

      if (rpcError) throw rpcError

      dailyData.value = data || []
      return { success: true, data }
    } catch (err) {
      reportClientError('reports.daily_activity', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.daily = false
    }
  }

  /**
   * Obtiene actividad por hora del día en un rango de fechas
   * @param {String} startDate - Fecha de inicio (ISO string)
   * @param {String} endDate - Fecha de fin (ISO string)
   * Retorna: { hora, cantidad }
   */
  async function fetchHourlyActivity(startDate = null, endDate = null) {
    try {
      loading.hourly = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('get_hourly_activity_stats', {
          fecha_inicio: startDate,
          fecha_fin: endDate
        })

      if (rpcError) throw rpcError

      hourlyData.value = data || []
      return { success: true, data }
    } catch (err) {
      reportClientError('reports.hourly_activity', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.hourly = false
    }
  }

  async function fetchRevenueByRange(startDate, endDate) {
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(REVENUE_FIELDS)
        .gte('created_at', startDate)
        .lt('created_at', endDate)

      if (fetchError) throw fetchError
      return { success: true, data: data || [] }
    } catch (err) {
      reportClientError('reports.revenue_range', err)
      return { success: false, error: err.message, data: [] }
    }
  }

  async function fetchAttendanceByRange(startDate, endDate) {
    try {
      const { data, error: fetchError } = await supabase
        .from('attendance')
        .select(ATTENDANCE_ACTIVITY_FIELDS)
        .gte('created_at', startDate)
        .lt('created_at', endDate)

      if (fetchError) throw fetchError
      return { success: true, data: data || [] }
    } catch (err) {
      reportClientError('reports.attendance_range', err)
      return { success: false, error: err.message, data: [] }
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
        .select(OVERDUE_MEMBER_FIELDS)
        .eq('estado_cuota', 'vencido')
        .eq('activo', true)
        .order('apellido', { ascending: true })

      if (fetchError) throw fetchError

      overdueMembers.value = data || []
      return { success: true, data }
    } catch (err) {
      reportClientError('reports.overdue_members', err)
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
      reportClientError('reports.inactive_members', err)
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
  async function exportToExcel(data, filename = 'reporte') {
    try {
      if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar')
      }

      // Generar archivo y descargar
      const today = new Date().toISOString().split('T')[0]
      const fullFilename = `${filename}-${today}.xlsx`
      await downloadExcelWorkbook([{
        name: 'Datos',
        data: objectsToExcelRows(data)
      }], fullFilename)

      return { success: true }
    } catch (err) {
      reportClientError('reports.export_excel', err)
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
  async function exportOverdueMembers() {
    const formattedData = formatOverdueForExcel()
    return await exportToExcel(formattedData, 'socios-vencidos')
  }

  /**
   * Exporta socios inactivos a Excel
   */
  async function exportInactiveMembers() {
    const formattedData = formatInactiveForExcel()
    return await exportToExcel(formattedData, 'socios-inactivos')
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
    fetchRevenueByRange,
    fetchAttendanceByRange,
    fetchOverdueMembers,
    fetchInactiveMembers,
    
    // Métodos de exportación
    exportToExcel,
    exportOverdueMembers,
    exportInactiveMembers
  }
}

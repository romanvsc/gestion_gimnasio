import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { runQuery, runCountQuery } from '@/lib/asyncHandler'

export const useGymStore = defineStore('gym', () => {
  // Estado
  const stats = ref({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    todayAttendance: 0,
    periodAttendance: 0,
    monthlyRevenue: 0,
    periodRevenue: 0
  })
  
  // Comparación con periodo anterior
  const statsComparison = ref({
    revenueChange: 0,
    attendanceChange: 0
  })
  
  const loading = ref(false)
  const error = ref(null)

  /**
   * Helper: Formatea fecha a ISO string para queries
   */
  function formatDateForQuery(date) {
    if (!date) return null
    const d = new Date(date)
    return d.toISOString()
  }

  /**
   * Helper: Obtiene el inicio del día actual
   */
  function getTodayStart() {
    return new Date().toISOString().split('T')[0]
  }

  /**
   * Obtiene las estadísticas generales del gimnasio
   * @param {Object} dateRange - Rango de fechas opcional { start: Date, end: Date }
   */
  async function getStats(dateRange = null) {
    try {
      loading.value = true
      error.value = null

      // Usar rango de fechas proporcionado o default al mes actual
      const now = new Date()
      const range = dateRange || {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      }
      
      const rangeStart = formatDateForQuery(range.start)
      const rangeEnd = formatDateForQuery(range.end)
      
      // Obtener total de miembros
      const totalMembers = await runCountQuery(() =>
        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
      )

      // Obtener miembros activos y vencidos desde la vista
      const membersStatus = await runQuery(() =>
        supabase
          .from('v_socios_estado')
          .select('estado_cuota')
      )

      const activeMembers = membersStatus?.filter(m => m.estado_cuota === 'activo').length || 0
      const expiredMembers = membersStatus?.filter(m => m.estado_cuota === 'vencido').length || 0

      // Obtener asistencia de hoy (siempre es de hoy, no del periodo)
      const today = getTodayStart()
      const todayAttendance = await runCountQuery(() =>
        supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today)
      )

      // Obtener asistencia del periodo seleccionado
      const periodAttendance = await runCountQuery(() =>
        supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', rangeStart)
          .lte('created_at', rangeEnd)
      )

      // Obtener ingresos del periodo seleccionado
      const payments = await runQuery(() =>
        supabase
          .from('payments')
          .select('monto')
          .gte('created_at', rangeStart)
          .lte('created_at', rangeEnd)
      )

      const periodRevenue = payments?.reduce((sum, p) => sum + Number(p.monto), 0) || 0

      stats.value = {
        totalMembers: totalMembers || 0,
        activeMembers,
        expiredMembers,
        todayAttendance: todayAttendance || 0,
        periodAttendance: periodAttendance || 0,
        monthlyRevenue: periodRevenue, // Mantener compatibilidad
        periodRevenue
      }

      return { success: true, data: stats.value }
    } catch (err) {
      console.error('Error al obtener estadísticas:', err)
      error.value = err.message
      
      // Resetear stats en caso de error crítico
      stats.value = {
        totalMembers: 0,
        activeMembers: 0,
        expiredMembers: 0,
        todayAttendance: 0,
        periodAttendance: 0,
        monthlyRevenue: 0,
        periodRevenue: 0
      }
      
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene estadísticas para un rango específico (sin actualizar estado)
   * @param {Object} range - { start: Date, end: Date }
   */
  async function getStatsForRange(range) {
    const rangeStart = formatDateForQuery(range.start)
    const rangeEnd = formatDateForQuery(range.end)
    
    // Asistencia del rango
    const attendance = await runCountQuery(() =>
      supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', rangeStart)
        .lte('created_at', rangeEnd)
    )

    // Ingresos del rango
    const payments = await runQuery(() =>
      supabase
        .from('payments')
        .select('monto')
        .gte('created_at', rangeStart)
        .lte('created_at', rangeEnd)
    )

    const revenue = payments?.reduce((sum, p) => sum + Number(p.monto), 0) || 0

    return {
      attendance: attendance || 0,
      revenue
    }
  }

  /**
   * Calcula el porcentaje de cambio entre dos valores
   */
  function calculatePercentChange(current, previous) {
    if (previous === 0) {
      return current > 0 ? 100 : 0
    }
    return ((current - previous) / previous) * 100
  }

  /**
   * Obtiene la comparación de estadísticas entre el periodo actual y el anterior
   * Solo para Ingresos y Asistencia
   * @param {Object} currentRange - { start: Date, end: Date }
   * @param {Object} previousRange - { start: Date, end: Date }
   */
  async function getStatsComparison(currentRange, previousRange) {
    try {
      const [currentStats, previousStats] = await Promise.all([
        getStatsForRange(currentRange),
        getStatsForRange(previousRange)
      ])

      const revenueChange = calculatePercentChange(
        currentStats.revenue,
        previousStats.revenue
      )
      
      const attendanceChange = calculatePercentChange(
        currentStats.attendance,
        previousStats.attendance
      )

      statsComparison.value = {
        revenueChange: parseFloat(revenueChange.toFixed(1)),
        attendanceChange: parseFloat(attendanceChange.toFixed(1))
      }

      return { success: true, data: statsComparison.value }
    } catch (err) {
      console.error('Error al obtener comparación de estadísticas:', err)
      statsComparison.value = {
        revenueChange: 0,
        attendanceChange: 0
      }
      return { success: false, error: err.message }
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
    stats,
    statsComparison,
    loading,
    error,
    // Métodos
    getStats,
    getStatsComparison,
    getStatsForRange,
    clearError
  }
})
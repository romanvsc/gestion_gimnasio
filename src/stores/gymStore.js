import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useGymStore = defineStore('gym', () => {
  // Estado
  const stats = ref({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    todayAttendance: 0,
    monthlyRevenue: 0
  })
  const loading = ref(false)
  const error = ref(null)

  /**
   * Obtiene las estadísticas generales del gimnasio
   */
  async function getStats() {
    try {
      loading.value = true
      error.value = null

      // Obtener total de miembros
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      // Obtener miembros activos y vencidos desde la vista
      const { data: membersStatus } = await supabase
        .from('v_socios_estado')
        .select('estado_cuota')

      const activeMembers = membersStatus?.filter(m => m.estado_cuota === 'activo').length || 0
      const expiredMembers = membersStatus?.filter(m => m.estado_cuota === 'vencido').length || 0

      // Obtener asistencia de hoy
      const today = new Date().toISOString().split('T')[0]
      const { count: todayAttendance } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)

      // Obtener ingresos del mes actual
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { data: payments } = await supabase
        .from('payments')
        .select('monto')
        .gte('created_at', firstDayOfMonth)

      const monthlyRevenue = payments?.reduce((sum, p) => sum + Number(p.monto), 0) || 0

      stats.value = {
        totalMembers: totalMembers || 0,
        activeMembers,
        expiredMembers,
        todayAttendance: todayAttendance || 0,
        monthlyRevenue
      }

      return { success: true, data: stats.value }
    } catch (err) {
      console.error('Error al obtener estadísticas:', err)
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
    stats,
    loading,
    error,
    // Métodos
    getStats,
    clearError
  }
})
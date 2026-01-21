import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { runQuery } from '@/lib/asyncHandler'
import { formatTime } from '@/utils/formatters'

function mapAttendanceRow(row) {
  return {
    id: row.id,
    memberId: row.member_id,
    name: row.members ? `${row.members.nombre} ${row.members.apellido}` : 'Socio desconocido',
    dni: row.members?.dni || '-',
    time: formatTime(row.created_at),
    status: row.acceso_permitido ? 'activo' : 'vencido',
    statusLabel: row.acceso_permitido ? 'Al día' : 'Vencido'
  }
}

export function useAttendance(options = {}) {
  const recentLimit = options.recentLimit ?? 5

  const recentCheckIns = ref([])
  const loadingRecent = ref(false)
  const errorRecent = ref(null)

  let channel = null

  async function loadRecentCheckIns(limit = recentLimit) {
    try {
      loadingRecent.value = true
      errorRecent.value = null

      const data = await runQuery(() =>
        supabase
          .from('attendance')
          .select('id, member_id, created_at, acceso_permitido, members(nombre, apellido, dni)')
          .order('created_at', { ascending: false })
          .limit(limit)
      )

      recentCheckIns.value = (data || []).map(mapAttendanceRow)
      return { success: true, data: recentCheckIns.value }
    } catch (err) {
      console.error('Error cargando check-ins recientes:', err)
      errorRecent.value = err.message
      recentCheckIns.value = []
      return { success: false, error: err.message }
    } finally {
      loadingRecent.value = false
    }
  }

  async function fetchCheckInById(id) {
    return runQuery(() =>
      supabase
        .from('attendance')
        .select('id, member_id, created_at, acceso_permitido, members(nombre, apellido, dni)')
        .eq('id', id)
        .single()
    )
  }

  function subscribeToAttendanceInserts({
    channelName = 'dashboard-attendance',
    onInsert,
    limit = recentLimit
  } = {}) {
    // Evitar doble suscripción
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }

    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance' },
        async (payload) => {
          try {
            if (!payload?.new?.id) return

            // Hook para que el caller (Dashboard) refresque stats con throttle
            if (typeof onInsert === 'function') {
              onInsert(payload.new)
            }

            // Update incremental de la tabla: trae solo el registro insertado con join a members
            const row = await fetchCheckInById(payload.new.id)
            const mapped = mapAttendanceRow(row)

            // Evitar duplicados
            if (recentCheckIns.value.some((c) => c.id === mapped.id)) return

            recentCheckIns.value = [mapped, ...recentCheckIns.value].slice(0, limit)
          } catch (err) {
            console.warn('Realtime insert: fallback a recarga de recientes', err)
            // Fallback seguro: recargar lista (sigue siendo más barato que recargar todo el dashboard)
            await loadRecentCheckIns(limit)
          }
        }
      )
      .subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
    }
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  return {
    // State
    recentCheckIns,
    loadingRecent,
    errorRecent,

    // Actions
    loadRecentCheckIns,
    subscribeToAttendanceInserts,
    unsubscribe
  }
}

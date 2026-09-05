import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { runQuery } from '@/lib/asyncHandler'
import { formatTime } from '@/utils/formatters'
import { reportClientError } from '@/lib/observability'

const ATTENDANCE_FIELDS = 'id, member_id, created_at, acceso_permitido'
const ATTENDANCE_WITH_MEMBER_FIELDS = 'id, member_id, created_at, acceso_permitido, members(nombre, apellido, dni)'

function mapAttendanceRow(row) {
  const memberName = row.members ? `${row.members.nombre} ${row.members.apellido}` : 'Socio desconocido'

  return {
    id: row.id,
    memberId: row.member_id,
    name: memberName,
    member_name: memberName,
    dni: row.members?.dni || '-',
    created_at: row.created_at,
    acceso_permitido: row.acceso_permitido,
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
          .select(ATTENDANCE_WITH_MEMBER_FIELDS)
          .order('created_at', { ascending: false })
          .limit(limit)
      )

      recentCheckIns.value = (data || []).map(mapAttendanceRow)
      return { success: true, data: recentCheckIns.value }
    } catch (err) {
      reportClientError('attendance.recent_fetch', err)
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
        .select(ATTENDANCE_WITH_MEMBER_FIELDS)
        .eq('id', id)
        .single()
    )
  }

  async function hasCheckInOnDate({ memberId, startISO, endISO }) {
    const data = await runQuery(() => supabase
      .from('attendance')
      .select('id, created_at')
      .eq('member_id', memberId)
      .gte('created_at', startISO)
      .lt('created_at', endISO)
      .limit(1)
    )

    return data?.[0] || null
  }

  async function listMemberAttendances(memberId, limit = 50) {
    try {
      return await runQuery(() => supabase
        .from('attendance')
        .select(ATTENDANCE_FIELDS)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(limit)
      )
    } catch (err) {
      reportClientError('attendance.member_history_fetch', err)
      throw err
    }
  }

  async function registerCheckIn({ memberId, allowed, createdAt }) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        member_id: memberId,
        acceso_permitido: allowed,
        created_at: createdAt
      }])
      .select('id, member_id, created_at, acceso_permitido')
      .single()

    if (error) throw error
    return data
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
            reportClientError('attendance.realtime_insert', err)
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
    listMemberAttendances,
    hasCheckInOnDate,
    registerCheckIn,
    subscribeToAttendanceInserts,
    unsubscribe
  }
}

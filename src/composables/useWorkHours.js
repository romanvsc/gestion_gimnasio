import { ref } from 'vue'
import { workHours } from '@/contexts/work-hours'
import { reportClientError } from '@/lib/observability'
import { toUserMessage } from '@/lib/userFacingError'

function getFriendlyError(error) {
  if (error?.code === '23P01') return 'Este intervalo se superpone con otra jornada. Elegí un horario que no se cruce.'
  if (error?.code === '23505') return 'Ya existe un intervalo cargado con esos datos.'
  if (error?.code === '42501') return 'No tenés permiso para modificar esa jornada.'
  return toUserMessage(error, 'No pudimos completar la operación. Intentá de nuevo.')
}

export function useWorkHours() {
  const shifts = ref([])
  const receptionists = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function loadMonth(staffId, month) {
    if (!staffId || !month) {
      shifts.value = []
      return { success: true, data: [] }
    }

    loading.value = true
    error.value = null

    try {
      shifts.value = await workHours.listMonth(staffId, month)
      return { success: true, data: shifts.value }
    } catch (err) {
      error.value = getFriendlyError(err)
      reportClientError('work_hours.list_month', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function loadReceptionists() {
    loading.value = true
    error.value = null

    try {
      receptionists.value = await workHours.listReceptionists()
      return { success: true, data: receptionists.value }
    } catch (err) {
      error.value = getFriendlyError(err)
      reportClientError('work_hours.list_receptionists', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function saveShift({ id = null, staff_id, work_date, start_time, end_time }) {
    saving.value = true
    error.value = null

    try {
      const savedShift = id
        ? await workHours.update(id, { staff_id, work_date, start_time, end_time })
        : await workHours.create({ staff_id, work_date, start_time, end_time })

      return { success: true, data: savedShift }
    } catch (err) {
      error.value = getFriendlyError(err)
      reportClientError('work_hours.save_shift', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  return {
    shifts,
    receptionists,
    loading,
    saving,
    error,
    loadMonth,
    loadReceptionists,
    saveShift
  }
}

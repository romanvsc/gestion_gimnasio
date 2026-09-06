import { ref } from 'vue'
import { workHours } from '@/contexts/work-hours'
import { reportClientError } from '@/lib/observability'

function getFriendlyError(error) {
  if (error?.code === '23505') return 'Ya existe una jornada cargada para esa persona y fecha.'
  if (error?.code === '42501') return 'No tenés permisos para modificar esa jornada.'
  return error?.message || 'No se pudo completar la operación.'
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

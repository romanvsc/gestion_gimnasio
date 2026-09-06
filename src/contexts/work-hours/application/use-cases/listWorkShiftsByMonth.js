import { getWorkMonthRange } from '../../domain/services/workMonth.js'

export async function listWorkShiftsByMonth({ workShiftRepository, staffId, month }) {
  const range = getWorkMonthRange(month)
  return workShiftRepository.findByStaffAndMonth(staffId, range)
}

import { WorkShift } from '../../domain/entities/WorkShift.js'
import { getWorkMonthRange, validateWorkShiftOverlaps } from '../../domain/services/workMonth.js'

export async function updateWorkShift({ workShiftRepository, clock, id, input }) {
  const shift = WorkShift.create({
    ...input,
    id,
    today: clock.today()
  })

  const existingShifts = await workShiftRepository.findByStaffAndMonth(
    shift.staff_id,
    getWorkMonthRange(shift.work_date.slice(0, 7))
  )

  validateWorkShiftOverlaps([...existingShifts, shift], { ignoreId: id })

  return workShiftRepository.update(id, shift)
}

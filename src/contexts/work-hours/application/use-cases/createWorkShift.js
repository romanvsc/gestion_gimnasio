import { WorkShift } from '../../domain/entities/WorkShift.js'
import { getWorkMonthRange, validateWorkShiftOverlaps } from '../../domain/services/workMonth.js'

export async function createWorkShift({ workShiftRepository, clock, input }) {
  const shift = WorkShift.create({
    ...input,
    today: clock.today()
  })

  const existingShifts = await workShiftRepository.findByStaffAndMonth(
    shift.staff_id,
    getWorkMonthRange(shift.work_date.slice(0, 7))
  )

  validateWorkShiftOverlaps([...existingShifts, shift])

  return workShiftRepository.create(shift)
}

import { WorkShift } from '../../domain/entities/WorkShift.js'

export async function createWorkShift({ workShiftRepository, clock, input }) {
  const shift = WorkShift.create({
    ...input,
    today: clock.today()
  })

  return workShiftRepository.create(shift)
}

import { WorkShift } from '../../domain/entities/WorkShift.js'

export async function updateWorkShift({ workShiftRepository, clock, id, input }) {
  const shift = WorkShift.create({
    ...input,
    id,
    today: clock.today()
  })

  return workShiftRepository.update(id, shift)
}

import { supabase } from '@/lib/supabase'
import { createWorkShift } from './application/use-cases/createWorkShift.js'
import { listReceptionists } from './application/use-cases/listReceptionists.js'
import { listWorkShiftsByMonth } from './application/use-cases/listWorkShiftsByMonth.js'
import { updateWorkShift } from './application/use-cases/updateWorkShift.js'
import { createLocalBusinessClock } from './infrastructure/auth/LocalBusinessClock.js'
import { createSupabaseReceptionistRosterReader } from './infrastructure/persistence/SupabaseReceptionistRosterReader.js'
import { createSupabaseWorkShiftRepository } from './infrastructure/persistence/SupabaseWorkShiftRepository.js'

const workShiftRepository = createSupabaseWorkShiftRepository({ client: supabase })
const receptionistRosterReader = createSupabaseReceptionistRosterReader({ client: supabase })
const clock = createLocalBusinessClock()

function serializeWorkShift(shift) {
  return shift.toJSON()
}

function serializeWorkShifts(shifts) {
  return (shifts || []).map(serializeWorkShift)
}

export const workHours = Object.freeze({
  today() {
    return clock.today()
  },

  async listMonth(staffId, month) {
    return serializeWorkShifts(await listWorkShiftsByMonth({
      workShiftRepository,
      staffId,
      month
    }))
  },

  async listReceptionists() {
    return listReceptionists({ receptionistRosterReader })
  },

  async create(input) {
    return serializeWorkShift(await createWorkShift({
      workShiftRepository,
      clock,
      input
    }))
  },

  async update(id, input) {
    return serializeWorkShift(await updateWorkShift({
      workShiftRepository,
      clock,
      id,
      input
    }))
  }
})

export { formatWorkDuration } from './domain/entities/WorkShift.js'
export { getWorkMonthRange, normalizeWorkMonth, summarizeWorkShifts } from './domain/services/workMonth.js'

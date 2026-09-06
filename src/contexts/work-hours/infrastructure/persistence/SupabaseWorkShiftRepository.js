import { WorkShift } from '../../domain/entities/WorkShift.js'

export const WORK_SHIFT_FIELDS = 'id, staff_id, work_date, start_time, end_time, created_at, updated_at'

async function execute(query) {
  const { data, error } = await query

  if (error) throw error
  return data
}

function mapWorkShift(row) {
  return WorkShift.fromPersistence(row)
}

/**
 * Adaptador driven del aggregate WorkShift.
 */
export function createSupabaseWorkShiftRepository({ client }) {
  if (!client) {
    throw new Error('Se requiere un cliente Supabase para el repositorio de jornadas')
  }

  return {
    async findByStaffAndMonth(staffId, { startDate, endDate }) {
      const data = await execute(
        client
          .from('staff_work_hours')
          .select(WORK_SHIFT_FIELDS)
          .eq('staff_id', staffId)
          .gte('work_date', startDate)
          .lte('work_date', endDate)
          .order('work_date')
      )

      return (data || []).map(mapWorkShift)
    },

    async create(workShift) {
      const data = await execute(
        client
          .from('staff_work_hours')
          .insert([workShift.toPersistence()])
          .select(WORK_SHIFT_FIELDS)
          .single()
      )

      return mapWorkShift(data)
    },

    async update(id, workShift) {
      const data = await execute(
        client
          .from('staff_work_hours')
          .update(workShift.toPersistence())
          .eq('id', id)
          .select(WORK_SHIFT_FIELDS)
          .single()
      )

      return mapWorkShift(data)
    }
  }
}

import { Plan } from '../../domain/entities/Plan.js'

const PLAN_FIELDS = 'id, nombre, dias_duracion, precio, precio_socio, activo'

async function execute(query) {
  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

function mapPlan(row) {
  return Plan.fromPersistence(row)
}

/**
 * Adaptador driven: traduce Supabase al puerto PlanRepository.
 * @param {{ client: Object }} dependencies
 */
export function createSupabasePlanRepository({ client }) {
  if (!client) {
    throw new Error('Se requiere un cliente Supabase para el repositorio de planes')
  }

  return {
    async findActive() {
      const data = await execute(
        client
          .from('plans')
          .select(PLAN_FIELDS)
          .eq('activo', true)
          .order('nombre')
      )

      return (data || []).map(mapPlan)
    },

    async findAll() {
      const data = await execute(
        client
          .from('plans')
          .select(PLAN_FIELDS)
          .order('nombre')
      )

      return (data || []).map(mapPlan)
    },

    async create(plan) {
      const data = await execute(
        client
          .from('plans')
          .insert([plan.toPersistence()])
          .select(PLAN_FIELDS)
          .single()
      )

      return mapPlan(data)
    },

    async update(id, plan) {
      const data = await execute(
        client
          .from('plans')
          .update(plan.toPersistence())
          .eq('id', id)
          .select(PLAN_FIELDS)
          .single()
      )

      return mapPlan(data)
    }
  }
}

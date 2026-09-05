import { Plan } from '../../domain/entities/Plan.js'

/**
 * @param {{ planRepository: import('../ports/PlanRepository.js').PlanRepository, id: number|string, input: Object }} dependencies
 */
export async function updatePlan({ planRepository, id, input }) {
  const plan = Plan.create({ ...input, id })
  return planRepository.update(id, plan)
}

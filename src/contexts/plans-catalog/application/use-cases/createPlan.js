import { Plan } from '../../domain/entities/Plan.js'

/**
 * @param {{ planRepository: import('../ports/PlanRepository.js').PlanRepository, input: Object }} dependencies
 */
export async function createPlan({ planRepository, input }) {
  const plan = Plan.create(input)
  return planRepository.create(plan)
}

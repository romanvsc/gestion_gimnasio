/**
 * @param {{ planRepository: import('../ports/PlanRepository.js').PlanRepository }} dependencies
 */
export function listAllPlans({ planRepository }) {
  return () => planRepository.findAll()
}

/**
 * @param {{ planRepository: import('../ports/PlanRepository.js').PlanRepository }} dependencies
 */
export function listActivePlans({ planRepository }) {
  return () => planRepository.findActive()
}

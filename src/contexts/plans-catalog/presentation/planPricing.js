import { Plan } from '../domain/entities/Plan.js'

/**
 * Única entrada de presentación para resolver el precio de un plan.
 * @param {Object|Plan} planData
 * @param {boolean} isClubMember
 */
export function resolvePlanPrice(planData, isClubMember = false) {
  const plan = planData instanceof Plan ? planData : Plan.fromPersistence(planData)
  return plan.resolvePrice(isClubMember)
}

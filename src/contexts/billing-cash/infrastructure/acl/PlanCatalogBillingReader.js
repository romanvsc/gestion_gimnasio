import { resolvePlanPrice } from '@/contexts/plans-catalog'

/**
 * Anti-corruption layer: Billing recibe un snapshot mínimo del catálogo,
 * sin importar ni exponer la entidad Plan.
 */
export function createPlanCatalogBillingReader({ catalog }) {
  if (!catalog) {
    throw new Error('Se requiere el catálogo de planes para registrar pagos')
  }

  return {
    async getBillingData({ planId, isClubMember = false }) {
      const plans = await catalog.listActive()
      const plan = plans.find(candidate => candidate.id == planId)

      if (!plan) {
        throw new Error('El plan seleccionado ya no está disponible')
      }

      return {
        planId: Number(plan.id),
        durationDays: Number(plan.dias_duracion),
        amount: resolvePlanPrice(plan, isClubMember)
      }
    }
  }
}

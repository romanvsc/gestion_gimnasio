import { supabase } from '@/lib/supabase'
import { createPlan as createPlanUseCase } from './application/use-cases/createPlan.js'
import { listActivePlans } from './application/use-cases/listActivePlans.js'
import { listAllPlans } from './application/use-cases/listAllPlans.js'
import { updatePlan as updatePlanUseCase } from './application/use-cases/updatePlan.js'
import { createSupabasePlanRepository } from './infrastructure/persistence/SupabasePlanRepository.js'

const planRepository = createSupabasePlanRepository({ client: supabase })
const listActive = listActivePlans({ planRepository })
const listAll = listAllPlans({ planRepository })

function serializePlan(plan) {
  return plan.toJSON()
}

function serializePlans(plans) {
  return (plans || []).map(serializePlan)
}

/**
 * Public API del contexto. Oculta el adaptador Supabase a los consumidores.
 */
export const planCatalog = Object.freeze({
  async listActive() {
    return serializePlans(await listActive())
  },

  async listAll() {
    return serializePlans(await listAll())
  },

  async create(input) {
    return serializePlan(await createPlanUseCase({ planRepository, input }))
  },

  async update(id, input) {
    return serializePlan(await updatePlanUseCase({ planRepository, id, input }))
  }
})

export { resolvePlanPrice } from './presentation/planPricing.js'

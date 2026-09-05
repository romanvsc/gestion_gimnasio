import { supabase } from '@/lib/supabase'
import { runQuery } from '@/lib/asyncHandler'
import { planCatalog } from '@/contexts/plans-catalog'
import { registerPayment as registerPaymentUseCase } from './application/use-cases/registerPayment.js'
import { listMemberPayments as listMemberPaymentsUseCase } from './application/use-cases/listMemberPayments.js'
import { loadCashRange as loadCashRangeUseCase } from './application/use-cases/loadCashRange.js'
import { registerManualTransaction as registerManualTransactionUseCase } from './application/use-cases/registerManualTransaction.js'
import { calculatePaymentEndDate } from './domain/services/paymentSchedule.js'
import { calculateCashSummary } from './domain/services/calculateCashSummary.js'
import { createSupabasePaymentRepository } from './infrastructure/persistence/SupabasePaymentRepository.js'
import { createSupabaseCashTransactionRepository } from './infrastructure/persistence/SupabaseCashTransactionRepository.js'
import { createSupabaseCurrentUserProvider } from './infrastructure/auth/SupabaseCurrentUserProvider.js'
import { createPlanCatalogBillingReader } from './infrastructure/acl/PlanCatalogBillingReader.js'

const paymentRepository = createSupabasePaymentRepository({
  client: supabase,
  executeQuery: runQuery
})
const cashTransactionRepository = createSupabaseCashTransactionRepository({
  client: supabase,
  executeQuery: runQuery
})
const currentUserProvider = createSupabaseCurrentUserProvider({ client: supabase })
const planBillingReader = createPlanCatalogBillingReader({ catalog: planCatalog })

const executeRegisterPayment = registerPaymentUseCase({
  paymentRepository,
  planBillingReader
})
const executeListMemberPayments = listMemberPaymentsUseCase({ paymentRepository })

function serializePayment(payment) {
  return payment.toJSON()
}

function serializeTransaction(transaction) {
  return transaction.toJSON()
}

/**
 * Public API del contexto. Los composables y las vistas no acceden a tablas,
 * RPCs ni autenticación de Supabase directamente para estos flujos.
 */
export const billingCash = Object.freeze({
  async registerPayment(input, { isClubMember = false } = {}) {
    return serializePayment(await executeRegisterPayment({ input, isClubMember }))
  },

  async listMemberPayments(memberId) {
    const payments = await executeListMemberPayments(memberId)
    return payments.map(serializePayment)
  },

  async loadCashRange({ startDate, endDate }) {
    const result = await loadCashRangeUseCase({
      cashTransactionRepository,
      startDate,
      endDate
    })

    return {
      balanceAnterior: result.balanceAnterior,
      transactions: result.transactions.map(serializeTransaction)
    }
  },

  async registerManualTransaction(input) {
    return serializeTransaction(await registerManualTransactionUseCase({
      cashTransactionRepository,
      currentUserProvider,
      input
    }))
  }
})

export { calculatePaymentEndDate, calculateCashSummary }

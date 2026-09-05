import { CashTransaction } from '../../domain/entities/CashTransaction.js'

export async function registerManualTransaction({
  cashTransactionRepository,
  currentUserProvider,
  input
}) {
  const createdBy = await currentUserProvider.getCurrentUserId()
  const transaction = CashTransaction.create({
    ...input,
    created_by: createdBy,
    payment_id: null
  })

  return cashTransactionRepository.create(transaction)
}

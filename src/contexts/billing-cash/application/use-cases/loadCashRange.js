import { normalizeIsoDate } from '../../domain/entities/Payment.js'

export async function loadCashRange({ cashTransactionRepository, startDate, endDate }) {
  const normalizedStartDate = normalizeIsoDate(startDate, 'La fecha inicial')
  const normalizedEndDate = normalizeIsoDate(endDate, 'La fecha final')

  if (normalizedStartDate > normalizedEndDate) {
    throw new Error('La fecha inicial no puede ser posterior a la fecha final')
  }

  const [balanceAnterior, transactions] = await Promise.all([
    cashTransactionRepository.getPreviousBalance(normalizedStartDate),
    cashTransactionRepository.findByDateRange({
      startDate: normalizedStartDate,
      endDate: normalizedEndDate
    })
  ])

  return {
    balanceAnterior: Number(balanceAnterior || 0),
    transactions
  }
}

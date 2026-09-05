function sumByType(transactions, type) {
  return transactions
    .filter(transaction => transaction.tipo === type)
    .reduce((sum, transaction) => sum + Number(transaction.monto || 0), 0)
}

/**
 * Calcula el resumen de caja sin depender de Vue ni de persistencia.
 */
export function calculateCashSummary({ balanceAnterior = 0, transactions = [] }) {
  const ingresos = sumByType(transactions, 'INGRESO')
  const egresos = sumByType(transactions, 'EGRESO')

  return Object.freeze({
    ingresos,
    egresos,
    saldoFinal: Number(balanceAnterior || 0) + ingresos - egresos
  })
}

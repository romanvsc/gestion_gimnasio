/**
 * Puerto driven para el agregado CashTransaction y sus lecturas de caja.
 * @typedef {Object} CashTransactionRepository
 * @property {(range: {startDate: string, endDate: string}) => Promise<import('../../domain/entities/CashTransaction.js').CashTransaction[]>} findByDateRange
 * @property {(startDate: string) => Promise<number>} getPreviousBalance
 * @property {(transaction: import('../../domain/entities/CashTransaction.js').CashTransaction) => Promise<import('../../domain/entities/CashTransaction.js').CashTransaction>} create
 */

export {}

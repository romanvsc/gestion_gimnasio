/**
 * Puerto driven para el agregado Payment.
 * @typedef {Object} PaymentRepository
 * @property {(payment: import('../../domain/entities/Payment.js').Payment) => Promise<import('../../domain/entities/Payment.js').Payment>} create
 * @property {(memberId: string) => Promise<import('../../domain/entities/Payment.js').Payment[]>} findByMember
 */

export {}

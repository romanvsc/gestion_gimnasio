import { normalizeIsoDate } from '../entities/Payment.js'

/**
 * Regla de dominio para calcular el vencimiento de una membresía pagada.
 */
export function calculatePaymentEndDate({ startDate, durationDays }) {
  const normalizedStartDate = normalizeIsoDate(startDate, 'La fecha de inicio')
  const duration = Number(durationDays)

  if (!Number.isInteger(duration) || duration <= 0) {
    throw new Error('La duración debe ser un número entero mayor que cero')
  }

  const endDate = new Date(`${normalizedStartDate}T00:00:00Z`)
  endDate.setUTCDate(endDate.getUTCDate() + duration)

  return endDate.toISOString().slice(0, 10)
}

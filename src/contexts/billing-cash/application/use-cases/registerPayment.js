import { Payment } from '../../domain/entities/Payment.js'
import { calculatePaymentEndDate } from '../../domain/services/paymentSchedule.js'

/**
 * Registra un pago usando el precio y la duración vigentes del catálogo.
 * El resultado persistido conserva el monto como snapshot histórico.
 */
export async function registerPayment({ paymentRepository, planBillingReader, input, isClubMember = false }) {
  const billingData = await planBillingReader.getBillingData({
    planId: input.plan_id,
    isClubMember
  })

  const payment = Payment.create({
    ...input,
    plan_id: billingData.planId,
    monto: billingData.amount,
    fecha_fin: calculatePaymentEndDate({
      startDate: input.fecha_inicio,
      durationDays: billingData.durationDays
    })
  })

  return paymentRepository.create(payment)
}

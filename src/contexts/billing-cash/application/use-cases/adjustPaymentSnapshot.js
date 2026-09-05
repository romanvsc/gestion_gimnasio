import { PaymentAdjustment } from '../../domain/entities/PaymentAdjustment.js'

/**
 * Caso de uso administrativo. La autorización definitiva vive en RLS/RPC;
 * esta capa solo valida el comando y coordina el puerto.
 */
export async function adjustPaymentSnapshot({ paymentAdjustmentRepository, input }) {
  const adjustment = PaymentAdjustment.create(input)
  return paymentAdjustmentRepository.adjust(adjustment)
}

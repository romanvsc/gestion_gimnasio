import { PaymentAdjustment } from '../../domain/entities/PaymentAdjustment.js'

async function execute(queryFactory) {
  const { data, error } = await queryFactory()

  if (error) throw error

  return data
}

/**
 * Adaptador para el RPC administrativo. No actualiza tablas desde el cliente:
 * el RPC impone rol, atomicidad y auditoría.
 */
export function createSupabasePaymentAdjustmentRepository({ client, executeQuery = execute }) {
  if (!client) {
    throw new Error('Se requiere un cliente Supabase para ajustar pagos')
  }

  return {
    async adjust(adjustment) {
      const data = await executeQuery(() => client.rpc(
        'admin_adjust_payment_snapshot',
        adjustment.toRpcParams()
      ))

      const row = Array.isArray(data) ? data[0] : data
      return PaymentAdjustment.fromPersistence(row)
    }
  }
}

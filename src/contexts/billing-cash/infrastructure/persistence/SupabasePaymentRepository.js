import { Payment } from '../../domain/entities/Payment.js'

const PAYMENT_FIELDS = `
  id,
  created_at,
  member_id,
  plan_id,
  monto,
  metodo_pago,
  fecha_inicio,
  fecha_fin,
  plans (
    nombre,
    precio,
    dias_duracion
  )
`

async function execute(queryFactory) {
  const { data, error } = await queryFactory()

  if (error) {
    throw error
  }

  return data
}

function mapPayment(row) {
  return Payment.fromPersistence(row)
}

/**
 * Adaptador driven para pagos. Traduce errores de Supabase a excepciones del
 * contexto y mantiene los campos de persistencia fuera del dominio.
 */
export function createSupabasePaymentRepository({ client, executeQuery = execute }) {
  if (!client) {
    throw new Error('Se requiere un cliente Supabase para el repositorio de pagos')
  }

  return {
    async create(payment) {
      const data = await executeQuery(
        () => client
          .from('payments')
          .insert([payment.toPersistence()])
          .select(PAYMENT_FIELDS)
          .single()
      )

      return mapPayment(data)
    },

    async findByMember(memberId) {
      const data = await executeQuery(
        () => client
          .from('payments')
          .select(PAYMENT_FIELDS)
          .eq('member_id', memberId)
          .order('created_at', { ascending: false })
      )

      return (data || []).map(mapPayment)
    }
  }
}

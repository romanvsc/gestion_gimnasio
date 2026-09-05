import { CashTransaction } from '../../domain/entities/CashTransaction.js'

function toStartOfDay(date) {
  return `${date}T00:00:00`
}

function toEndOfDay(date) {
  return `${date}T23:59:59`
}

/**
 * Adaptador driven para movimientos de caja y el RPC de saldo anterior.
 */
export function createSupabaseCashTransactionRepository({ client, executeQuery }) {
  if (!client) {
    throw new Error('Se requiere un cliente Supabase para el repositorio de caja')
  }

  if (!executeQuery) {
    throw new Error('Se requiere un ejecutor de consultas para el repositorio de caja')
  }

  return {
    async getPreviousBalance(startDate) {
      const data = await executeQuery(() =>
        client.rpc('get_previous_balance', { check_date: startDate })
      )

      return Number(data || 0)
    },

    async findByDateRange({ startDate, endDate }) {
      const data = await executeQuery(() =>
        client
          .from('transactions')
          .select('*')
          .gte('created_at', toStartOfDay(startDate))
          .lte('created_at', toEndOfDay(endDate))
          .order('created_at', { ascending: false })
      )

      return (data || []).map(row => CashTransaction.fromPersistence(row))
    },

    async create(transaction) {
      const data = await executeQuery(() =>
        client
          .from('transactions')
          .insert(transaction.toPersistence())
          .select('*')
          .single()
      )

      return CashTransaction.fromPersistence(data)
    }
  }
}

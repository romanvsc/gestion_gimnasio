import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createSupabaseCashTransactionRepository } from '../src/contexts/billing-cash/infrastructure/persistence/SupabaseCashTransactionRepository.js'
import { createSupabasePaymentRepository } from '../src/contexts/billing-cash/infrastructure/persistence/SupabasePaymentRepository.js'
import { createSupabasePaymentAdjustmentRepository } from '../src/contexts/billing-cash/infrastructure/persistence/SupabasePaymentAdjustmentRepository.js'
import { createSupabasePlanRepository } from '../src/contexts/plans-catalog/infrastructure/persistence/SupabasePlanRepository.js'
import { CashTransaction } from '../src/contexts/billing-cash/domain/entities/CashTransaction.js'
import { Payment } from '../src/contexts/billing-cash/domain/entities/Payment.js'
import { Plan } from '../src/contexts/plans-catalog/domain/entities/Plan.js'

function createFakeQuery(data, calls, error = null) {
  const query = {
    select(fields) {
      calls.push(['select', fields])
      return query
    },
    insert(payload) {
      calls.push(['insert', payload])
      return query
    },
    update(payload) {
      calls.push(['update', payload])
      return query
    },
    eq(field, value) {
      calls.push(['eq', field, value])
      return query
    },
    order(field, options) {
      calls.push(['order', field, options])
      return query
    },
    gte(field, value) {
      calls.push(['gte', field, value])
      return query
    },
    lte(field, value) {
      calls.push(['lte', field, value])
      return query
    },
    single() {
      calls.push(['single'])
      return query
    },
    then(resolve, reject) {
      return Promise.resolve({ data, error }).then(resolve, reject)
    }
  }

  return query
}

function createFakeClient(responses = {}) {
  const calls = []
  const client = {
    from(table) {
      calls.push(['from', table])
      return createFakeQuery(responses[table], calls)
    },
    rpc(name, args) {
      calls.push(['rpc', name, args])
      return createFakeQuery(responses[name], calls)
    }
  }

  return { client, calls }
}

const executeCashQuery = async (queryFactory) => {
  const { data, error } = await queryFactory()
  if (error) throw error
  return data
}

test('el adaptador de planes conserva el contrato del agregado y sus filtros', async () => {
  const { client, calls } = createFakeClient({
    plans: [{ id: 18, nombre: 'Todos los días', dias_duracion: 30, precio: 29000, precio_socio: 24000, activo: true }]
  })
  const repository = createSupabasePlanRepository({ client })

  const plans = await repository.findActive()

  assert.equal(plans.length, 1)
  assert.ok(plans[0] instanceof Plan)
  assert.equal(plans[0].resolvePrice(true), 24000)
  assert.deepEqual(calls, [
    ['from', 'plans'],
    ['select', 'id, nombre, dias_duracion, precio, precio_socio, activo'],
    ['eq', 'activo', true],
    ['order', 'nombre', undefined]
  ])
})

test('el adaptador de pagos persiste y reconstruye snapshots históricos', async () => {
  const paymentRow = {
    id: 'payment-1',
    created_at: '2026-09-04T12:00:00Z',
    member_id: 'member-1',
    plan_id: 18,
    monto: 24000,
    metodo_pago: 'Efectivo',
    fecha_inicio: '2026-09-04',
    fecha_fin: '2026-10-04',
    plans: { nombre: 'Todos los días' }
  }
  const { client, calls } = createFakeClient({ payments: paymentRow })
  const repository = createSupabasePaymentRepository({ client })
  const payment = Payment.create(paymentRow)

  const persisted = await repository.create(payment)

  assert.ok(persisted instanceof Payment)
  assert.equal(persisted.monto, 24000)
  assert.equal(persisted.plan_nombre, 'Todos los días')
  assert.equal('plan_nombre' in payment.toPersistence(), false)
  assert.deepEqual(calls[0], ['from', 'payments'])
  assert.equal(calls.some(([name, payload]) => name === 'insert' && payload[0].monto === 24000), true)
})

test('el adaptador de caja traduce RPC, rango y movimiento a entidades', async () => {
  const transactionRow = {
    id: 'transaction-1',
    created_at: '2026-09-04T12:00:00Z',
    tipo: 'INGRESO',
    categoria: 'Cuota',
    descripcion: 'Cobro automático',
    monto: 24000,
    created_by: 'staff-1',
    payment_id: 'payment-1'
  }
  const { client, calls } = createFakeClient({
    get_previous_balance: 1000,
    transactions: [transactionRow]
  })
  const repository = createSupabaseCashTransactionRepository({ client, executeQuery: executeCashQuery })

  assert.equal(await repository.getPreviousBalance('2026-09-01'), 1000)
  const transactions = await repository.findByDateRange({ startDate: '2026-09-01', endDate: '2026-09-04' })

  assert.ok(transactions[0] instanceof CashTransaction)
  assert.equal(transactions[0].payment_id, 'payment-1')
  assert.deepEqual(calls.slice(0, 2), [
    ['rpc', 'get_previous_balance', { check_date: '2026-09-01' }],
    ['from', 'transactions']
  ])
  assert.equal(calls.some(([name, field, value]) => name === 'gte' && field === 'created_at' && value === '2026-09-01T00:00:00'), true)
  assert.equal(calls.some(([name, field, value]) => name === 'lte' && field === 'created_at' && value === '2026-09-04T23:59:59'), true)
})

test('el adaptador de ajustes delega atomicidad y autorización al RPC', async () => {
  const { client, calls } = createFakeClient({
    admin_adjust_payment_snapshot: [{
      id: 1,
      payment_id: 'payment-1',
      monto_anterior: 20000,
      monto_nuevo: 24000,
      motivo: 'Corrección de tarifa comunicada por administración',
      operador_id: 'admin-1',
      created_at: '2026-09-04T12:00:00Z'
    }]
  })
  const repository = createSupabasePaymentAdjustmentRepository({ client })

  const result = await repository.adjust({
    toRpcParams: () => ({
      p_payment_id: 'payment-1',
      p_new_amount: 24000,
      p_reason: 'Corrección de tarifa comunicada por administración'
    })
  })

  assert.equal(result.monto_anterior, 20000)
  assert.equal(result.monto_nuevo, 24000)
  assert.deepEqual(calls, [[
    'rpc',
    'admin_adjust_payment_snapshot',
    {
      p_payment_id: 'payment-1',
      p_new_amount: 24000,
      p_reason: 'Corrección de tarifa comunicada por administración'
    }
  ]])
})

test('los adaptadores rechazan dependencias obligatorias ausentes', () => {
  assert.throws(() => createSupabasePlanRepository({}), /cliente Supabase/i)
  assert.throws(() => createSupabasePaymentRepository({}), /cliente Supabase/i)
  assert.throws(() => createSupabaseCashTransactionRepository({ client: {} }), /ejecutor de consultas/i)
})

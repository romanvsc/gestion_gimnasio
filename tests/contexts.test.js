import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { normalizeGymName } from '../src/contexts/gym-identity-config/domain/services/normalizeGymName.js'
import { CashTransaction } from '../src/contexts/billing-cash/domain/entities/CashTransaction.js'
import { Payment } from '../src/contexts/billing-cash/domain/entities/Payment.js'
import { PaymentAdjustment } from '../src/contexts/billing-cash/domain/entities/PaymentAdjustment.js'
import { calculateCashSummary } from '../src/contexts/billing-cash/domain/services/calculateCashSummary.js'
import { calculatePaymentEndDate } from '../src/contexts/billing-cash/domain/services/paymentSchedule.js'
import { registerPayment } from '../src/contexts/billing-cash/application/use-cases/registerPayment.js'
import { Plan } from '../src/contexts/plans-catalog/domain/entities/Plan.js'
import { resolvePlanPrice } from '../src/contexts/plans-catalog/presentation/planPricing.js'
import { BRAND, COLOR_SCALES } from '../src/config/brand.js'
import { UI_TOKENS } from '../src/config/uiTokens.js'

test('la identidad visual expone tokens semánticos sin duplicar colores de estado', () => {
  assert.equal(BRAND.name, 'Yacyretá')
  assert.equal(BRAND.colors.primary, COLOR_SCALES.primary[600])
  assert.equal(BRAND.colors.success, COLOR_SCALES.success[600])
  assert.equal(BRAND.colors.danger, COLOR_SCALES.danger[600])
  assert.equal(COLOR_SCALES.neutral[0], '#ffffff')
})

test('los tokens de texto de estado mantienen contraste AA sobre superficies claras', () => {
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g)
      .map(channel => Number.parseInt(channel, 16) / 255)
      .map(channel => channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4)

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }

  const contrast = (foreground, background) => {
    const foregroundLum = luminance(foreground)
    const backgroundLum = luminance(background)
    return (Math.max(foregroundLum, backgroundLum) + 0.05) /
      (Math.min(foregroundLum, backgroundLum) + 0.05)
  }

  for (const token of [
    COLOR_SCALES.primary[700],
    COLOR_SCALES.success[700],
    COLOR_SCALES.danger[700],
    COLOR_SCALES.warning[800],
    COLOR_SCALES.info[700],
    COLOR_SCALES.neutral[500]
  ]) {
    assert.ok(contrast(token, COLOR_SCALES.neutral[0]) >= 4.5, `${token} no alcanza AA`)
  }
})

test('los estados de presentacion usan tonos semanticos centralizados', async () => {
  const statusBadge = await readFile(
    new URL('../src/components/ui/StatusBadge.vue', import.meta.url),
    'utf8'
  )

  assert.equal(Object.keys(UI_TOKENS.tones).sort().join(','), 'danger,info,neutral,success,warning')
  assert.match(statusBadge, /UI_TOKENS\.tones\.success/)
  assert.match(statusBadge, /UI_TOKENS\.tones\.danger/)
  assert.match(statusBadge, /UI_TOKENS\.tones\.warning/)
  assert.doesNotMatch(statusBadge, /bg-(green|red|yellow|blue|gray)-/i)
})

test('normaliza placeholders heredados sin modificar nombres reales', () => {
  assert.equal(normalizeGymName('', 'Yacyretá'), 'Yacyretá')
  assert.equal(normalizeGymName('Gimnasio', 'Yacyretá'), 'Yacyretá')
  assert.equal(normalizeGymName('Ghost Gym', 'Yacyretá'), 'Yacyretá')
  assert.equal(normalizeGymName('Club Yacyretá', 'Yacyretá'), 'Club Yacyretá')
})

test('Plan resuelve tarifa de socio y tarifa regular desde un único agregado', () => {
  const plan = Plan.create({
    id: 18,
    nombre: 'Todos los días',
    dias_duracion: 30,
    precio: 29000,
    precio_socio: 24000
  })

  assert.equal(resolvePlanPrice(plan, true), 24000)
  assert.equal(resolvePlanPrice(plan, false), 29000)
  assert.deepEqual(plan.toPersistence(), {
    nombre: 'Todos los días',
    dias_duracion: 30,
    precio: 29000,
    precio_socio: 24000,
    activo: true
  })
})

test('Plan rechaza precios y duraciones inválidos', () => {
  assert.throws(
    () => Plan.create({ nombre: 'Inválido', dias_duracion: 0, precio: 1000 }),
    /duración.*entero mayor que cero/i
  )
  assert.throws(
    () => Plan.create({ nombre: 'Inválido', dias_duracion: 30, precio: -1 }),
    /precio regular no puede ser negativo/i
  )
})

test('la vigencia se calcula desde la fecha de inicio y la duración del plan', () => {
  assert.equal(
    calculatePaymentEndDate({ startDate: '2026-09-01', durationDays: 30 }),
    '2026-10-01'
  )
  assert.throws(
    () => calculatePaymentEndDate({ startDate: '2026-02-30', durationDays: 30 }),
    /fecha de inicio no es una fecha válida/i
  )
})

test('registrar pago conserva el monto resuelto como snapshot histórico', async () => {
  let persistedPayment = null

  const result = await registerPayment({
    planBillingReader: {
      async getBillingData() {
        return { planId: 18, amount: 24000, durationDays: 30 }
      }
    },
    paymentRepository: {
      async create(payment) {
        persistedPayment = payment
        return payment
      }
    },
    input: {
      member_id: 'member-1',
      plan_id: 18,
      monto: 1,
      metodo_pago: 'Efectivo',
      fecha_inicio: '2026-09-01'
    },
    isClubMember: true
  })

  assert.equal(result.monto, 24000)
  assert.equal(result.fecha_fin, '2026-10-01')
  assert.equal(persistedPayment.toPersistence().monto, 24000)
})

test('resumen de caja separa ingresos, egresos y saldo anterior', () => {
  assert.deepEqual(
    calculateCashSummary({
      balanceAnterior: 1000,
      transactions: [
        { tipo: 'INGRESO', monto: 24000 },
        { tipo: 'EGRESO', monto: 4000 },
        { tipo: 'INGRESO', monto: 29000 }
      ]
    }),
    { ingresos: 53000, egresos: 4000, saldoFinal: 50000 }
  )
})

test('Payment y CashTransaction validan sus invariantes mínimas', () => {
  const payment = Payment.create({
    member_id: 'member-1',
    plan_id: 18,
    monto: 24000,
    metodo_pago: 'Efectivo',
    fecha_inicio: '2026-09-01',
    fecha_fin: '2026-10-01'
  })
  const transaction = CashTransaction.create({
    tipo: 'ingreso',
    categoria: 'Cuota',
    monto: 24000,
    created_by: 'staff-1',
    payment_id: payment.id
  })

  assert.equal(transaction.tipo, 'INGRESO')
  assert.equal(transaction.monto, payment.monto)
  assert.throws(
    () => CashTransaction.create({ tipo: 'OTRO', categoria: 'X', monto: 1, created_by: 'staff-1' }),
    /INGRESO o EGRESO/i
  )
})

test('PaymentAdjustment exige motivo y monto válidos para una corrección auditada', () => {
  const adjustment = PaymentAdjustment.create({
    payment_id: 'payment-1',
    monto_nuevo: 24000,
    motivo: 'Corrección de tarifa comunicada por administración'
  })

  assert.deepEqual(adjustment.toRpcParams(), {
    p_payment_id: 'payment-1',
    p_new_amount: 24000,
    p_reason: 'Corrección de tarifa comunicada por administración'
  })
  assert.throws(
    () => PaymentAdjustment.create({ payment_id: 'payment-1', monto_nuevo: 24000, motivo: 'corto' }),
    /al menos 10 caracteres/i
  )
})

async function listJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listJavaScriptFiles(path))
    } else if (entry.name.endsWith('.js')) {
      files.push(path)
    }
  }

  return files
}

test('los dominios no dependen de Vue, Pinia, Supabase ni APIs de infraestructura', async () => {
  const projectRoot = join(fileURLToPath(new URL('..', import.meta.url)))
  const contextsRoot = join(projectRoot, 'src', 'contexts')
  const contextEntries = await readdir(contextsRoot, { withFileTypes: true })
  const domainFiles = []

  for (const entry of contextEntries) {
    if (!entry.isDirectory()) continue
    const domainDirectory = join(contextsRoot, entry.name, 'domain')
    try {
      domainFiles.push(...await listJavaScriptFiles(domainDirectory))
    } catch {
      // No todos los contextos tienen aún una capa de dominio extraída.
    }
  }

  const forbiddenImport = /from\s+['"](?:vue|pinia|@\/lib\/supabase|@supabase\/supabase-js)|from\s+['"]node:/

  for (const file of domainFiles) {
    const source = await readFile(file, 'utf8')
    assert.equal(
      forbiddenImport.test(source),
      false,
      `El dominio no debe importar infraestructura: ${relative(projectRoot, file)}`
    )
  }
})

test('los flujos de pago y check-in delegan persistencia en sus fachadas', async () => {
  const projectRoot = join(fileURLToPath(new URL('..', import.meta.url)))
  const paymentView = await readFile(join(projectRoot, 'src', 'views', 'Payments', 'NewPaymentView.vue'), 'utf8')
  const checkInView = await readFile(join(projectRoot, 'src', 'views', 'CheckIn', 'CheckInView.vue'), 'utf8')

  assert.doesNotMatch(paymentView, /from\(['"]@\/lib\/supabase['"]\)/i)
  assert.doesNotMatch(checkInView, /from\(['"]@\/lib\/supabase['"]\)/i)
  assert.match(paymentView, /billingCash|usePayments/i)
  assert.match(checkInView, /useAttendance/i)
})

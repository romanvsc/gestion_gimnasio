function requireText(value, fieldName) {
  const normalized = String(value ?? '').trim()

  if (!normalized) {
    throw new Error(`${fieldName} es obligatorio`)
  }

  return normalized
}

function requirePositiveNumber(value, fieldName) {
  const normalized = Number(value)

  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error(`${fieldName} debe ser un número mayor que cero`)
  }

  return normalized
}

function requirePositiveInteger(value, fieldName) {
  const normalized = Number(value)

  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new Error(`${fieldName} debe ser un número entero mayor que cero`)
  }

  return normalized
}

export function normalizeIsoDate(value, fieldName) {
  const normalized = String(value ?? '').trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(`${fieldName} debe tener formato ISO YYYY-MM-DD`)
  }

  const parsed = new Date(`${normalized}T00:00:00Z`)

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    throw new Error(`${fieldName} no es una fecha válida`)
  }

  return normalized
}

/**
 * Aggregate root de pagos. El monto queda congelado como snapshot histórico.
 * No conoce Vue, Supabase ni el mecanismo que dispara movimientos de caja.
 */
export class Payment {
  constructor({
    id = null,
    created_at = null,
    member_id,
    plan_id,
    monto,
    metodo_pago,
    fecha_inicio,
    fecha_fin,
    plan_nombre = null,
    plans = null
  }) {
    const normalizedStartDate = normalizeIsoDate(fecha_inicio, 'La fecha de inicio')
    const normalizedEndDate = normalizeIsoDate(fecha_fin, 'La fecha de fin')

    if (Date.parse(`${normalizedEndDate}T00:00:00Z`) < Date.parse(`${normalizedStartDate}T00:00:00Z`)) {
      throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio')
    }

    this.id = id
    this.created_at = created_at
    this.member_id = requireText(member_id, 'El socio')
    this.plan_id = requirePositiveInteger(plan_id, 'El plan')
    this.monto = requirePositiveNumber(monto, 'El monto')
    this.metodo_pago = requireText(metodo_pago, 'El método de pago')
    this.fecha_inicio = normalizedStartDate
    this.fecha_fin = normalizedEndDate
    this.plan_nombre = plan_nombre || plans?.nombre || null

    Object.freeze(this)
  }

  static create(attributes) {
    return new Payment(attributes)
  }

  static fromPersistence(row) {
    return new Payment(row)
  }

  toPersistence() {
    return {
      member_id: this.member_id,
      plan_id: this.plan_id,
      monto: this.monto,
      metodo_pago: this.metodo_pago,
      fecha_inicio: this.fecha_inicio,
      fecha_fin: this.fecha_fin
    }
  }

  toJSON() {
    return {
      id: this.id,
      created_at: this.created_at,
      ...this.toPersistence(),
      plan_nombre: this.plan_nombre
    }
  }
}

const TRANSACTION_TYPES = new Set(['INGRESO', 'EGRESO'])

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

/**
 * Aggregate root de un movimiento de caja manual o asociado a un pago.
 */
export class CashTransaction {
  constructor({
    id = null,
    created_at = null,
    tipo,
    categoria,
    descripcion = null,
    monto,
    created_by,
    payment_id = null
  }) {
    const normalizedType = requireText(tipo, 'El tipo de movimiento').toUpperCase()

    if (!TRANSACTION_TYPES.has(normalizedType)) {
      throw new Error('El tipo de movimiento debe ser INGRESO o EGRESO')
    }

    this.id = id
    this.created_at = created_at
    this.tipo = normalizedType
    this.categoria = requireText(categoria, 'La categoría')
    this.descripcion = descripcion ? String(descripcion).trim() : null
    this.monto = requirePositiveNumber(monto, 'El monto')
    this.created_by = requireText(created_by, 'El usuario creador')
    this.payment_id = payment_id || null

    Object.freeze(this)
  }

  static create(attributes) {
    return new CashTransaction(attributes)
  }

  static fromPersistence(row) {
    return new CashTransaction(row)
  }

  toPersistence() {
    return {
      tipo: this.tipo,
      categoria: this.categoria,
      descripcion: this.descripcion,
      monto: this.monto,
      created_by: this.created_by,
      payment_id: this.payment_id
    }
  }

  toJSON() {
    return {
      id: this.id,
      created_at: this.created_at,
      ...this.toPersistence()
    }
  }
}

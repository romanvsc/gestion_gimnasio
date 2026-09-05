function requireText(value, fieldName) {
  const normalized = String(value ?? '').trim()

  if (!normalized) {
    throw new Error(`${fieldName} es obligatorio`)
  }

  return normalized
}

function requirePositiveAmount(value, fieldName) {
  const amount = Number(value)

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${fieldName} debe ser mayor que cero`)
  }

  return amount
}

/**
 * Comando administrativo para corregir un snapshot de pago.
 * El cambio efectivo y su auditoría ocurren dentro del RPC del adaptador.
 */
export class PaymentAdjustment {
  constructor({
    payment_id,
    monto_nuevo,
    motivo,
    id = null,
    monto_anterior = null,
    operador_id = null,
    created_at = null
  }) {
    this.id = id
    this.payment_id = requireText(payment_id, 'El pago')
    this.monto_nuevo = requirePositiveAmount(monto_nuevo, 'El nuevo monto')
    this.motivo = requireText(motivo, 'El motivo')

    if (this.motivo.length < 10) {
      throw new Error('El motivo debe tener al menos 10 caracteres')
    }

    this.monto_anterior = monto_anterior === null || monto_anterior === undefined
      ? null
      : requirePositiveAmount(monto_anterior, 'El monto anterior')
    this.operador_id = operador_id
    this.created_at = created_at

    Object.freeze(this)
  }

  static create(attributes) {
    return new PaymentAdjustment(attributes)
  }

  static fromPersistence(row) {
    return new PaymentAdjustment({
      payment_id: row.payment_id,
      monto_nuevo: row.monto_nuevo,
      motivo: row.motivo,
      id: row.id,
      monto_anterior: row.monto_anterior,
      operador_id: row.operador_id,
      created_at: row.created_at
    })
  }

  toRpcParams() {
    return {
      p_payment_id: this.payment_id,
      p_new_amount: this.monto_nuevo,
      p_reason: this.motivo
    }
  }

  toJSON() {
    return {
      id: this.id,
      payment_id: this.payment_id,
      monto_anterior: this.monto_anterior,
      monto_nuevo: this.monto_nuevo,
      motivo: this.motivo,
      operador_id: this.operador_id,
      created_at: this.created_at
    }
  }
}

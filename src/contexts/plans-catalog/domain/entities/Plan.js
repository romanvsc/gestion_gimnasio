const EMPTY_OPTIONAL_PRICE = null

function normalizeRequiredNumber(value, fieldName) {
  if (value === null || value === undefined || String(value).trim() === '') {
    throw new Error(`${fieldName} es obligatorio`)
  }

  const number = Number(value)

  if (!Number.isFinite(number)) {
    throw new Error(`${fieldName} debe ser un número válido`)
  }

  return number
}

function normalizeOptionalPrice(value) {
  if (value === null || value === undefined || value === '') {
    return EMPTY_OPTIONAL_PRICE
  }

  const number = normalizeRequiredNumber(value, 'El precio socio')

  if (number < 0) {
    throw new Error('El precio socio no puede ser negativo')
  }

  return number
}

/**
 * Aggregate root del contexto Plans & Catalog.
 * No conoce Vue, Supabase ni detalles de persistencia.
 */
export class Plan {
  constructor({ id = null, nombre, dias_duracion, precio, precio_socio = null, activo = true }) {
    const normalizedName = String(nombre ?? '').trim()
    const normalizedDuration = normalizeRequiredNumber(dias_duracion, 'La duración')
    const normalizedPrice = normalizeRequiredNumber(precio, 'El precio regular')

    if (!normalizedName) {
      throw new Error('El nombre del plan es obligatorio')
    }

    if (!Number.isInteger(normalizedDuration) || normalizedDuration <= 0) {
      throw new Error('La duración debe ser un número entero mayor que cero')
    }

    if (normalizedPrice < 0) {
      throw new Error('El precio regular no puede ser negativo')
    }

    this.id = id
    this.nombre = normalizedName
    this.dias_duracion = normalizedDuration
    this.precio = normalizedPrice
    this.precio_socio = normalizeOptionalPrice(precio_socio)
    this.activo = activo !== false

    Object.freeze(this)
  }

  static create(attributes) {
    return new Plan(attributes)
  }

  static fromPersistence(row) {
    return new Plan(row)
  }

  resolvePrice(isClubMember = false) {
    if (isClubMember && this.precio_socio !== null) {
      return this.precio_socio
    }

    return this.precio
  }

  toPersistence() {
    return {
      nombre: this.nombre,
      dias_duracion: this.dias_duracion,
      precio: this.precio,
      precio_socio: this.precio_socio,
      activo: this.activo
    }
  }

  toJSON() {
    return {
      id: this.id,
      ...this.toPersistence()
    }
  }
}

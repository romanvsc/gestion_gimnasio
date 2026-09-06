const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const TIME_WITH_SECONDS_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?$/

function requireText(value, fieldName) {
  const normalized = String(value ?? '').trim()

  if (!normalized) {
    throw new Error(`${fieldName} es obligatorio`)
  }

  return normalized
}

export function normalizeWorkDate(value, fieldName = 'La fecha') {
  const normalized = requireText(value, fieldName)

  if (!ISO_DATE_PATTERN.test(normalized)) {
    throw new Error(`${fieldName} debe tener formato ISO YYYY-MM-DD`)
  }

  const parsed = new Date(`${normalized}T00:00:00Z`)

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    throw new Error(`${fieldName} no es una fecha válida`)
  }

  return normalized
}

export function normalizeWorkTime(value, fieldName) {
  const rawValue = requireText(value, fieldName)
  const normalized = TIME_WITH_SECONDS_PATTERN.test(rawValue) ? rawValue.slice(0, 5) : rawValue

  if (!TIME_PATTERN.test(normalized)) {
    throw new Error(`${fieldName} debe tener formato HH:mm`)
  }

  return normalized
}

export function timeToMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

export function calculateWorkMinutes(startTime, endTime) {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  if (endMinutes <= startMinutes) {
    throw new Error('La hora de salida debe ser posterior a la hora de entrada')
  }

  return endMinutes - startMinutes
}

export function formatWorkDuration(totalMinutes) {
  const minutes = Number(totalMinutes)

  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error('La duración debe ser un número de minutos válido')
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return `${remainingMinutes} min`
  if (remainingMinutes === 0) return `${hours} h`
  return `${hours} h ${remainingMinutes} min`
}

/**
 * Aggregate root del contexto Work Hours.
 * Solo representa una jornada por persona y fecha.
 * No conoce Vue, Supabase ni APIs del navegador.
 */
export class WorkShift {
  constructor({
    id = null,
    staff_id,
    work_date,
    start_time,
    end_time,
    created_at = null,
    updated_at = null,
    today = null
  }) {
    const normalizedDate = normalizeWorkDate(work_date, 'La fecha de trabajo')
    const normalizedStart = normalizeWorkTime(start_time, 'La hora de entrada')
    const normalizedEnd = normalizeWorkTime(end_time, 'La hora de salida')

    if (today !== null && normalizedDate > normalizeWorkDate(today, 'La fecha actual')) {
      throw new Error('No se pueden cargar jornadas futuras')
    }

    const durationMinutes = calculateWorkMinutes(normalizedStart, normalizedEnd)

    this.id = id
    this.staff_id = requireText(staff_id, 'La recepcionista')
    this.work_date = normalizedDate
    this.start_time = normalizedStart
    this.end_time = normalizedEnd
    this.created_at = created_at
    this.updated_at = updated_at
    this.duration_minutes = durationMinutes

    Object.freeze(this)
  }

  static create(attributes) {
    return new WorkShift(attributes)
  }

  static fromPersistence(row) {
    return new WorkShift(row)
  }

  toPersistence() {
    return {
      staff_id: this.staff_id,
      work_date: this.work_date,
      start_time: this.start_time,
      end_time: this.end_time
    }
  }

  toJSON() {
    return {
      id: this.id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      ...this.toPersistence(),
      duration_minutes: this.duration_minutes,
      duration_label: formatWorkDuration(this.duration_minutes)
    }
  }
}

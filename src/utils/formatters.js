/**
 * Formatters centralizados para la aplicación
 * Evita duplicación de lógica de formateo en componentes
 */

/**
 * Formatea un número como moneda sin símbolo (ej: "15.000")
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '0'
  return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

/**
 * Formatea un número como moneda con símbolo ARS (ej: "$ 15.000")
 */
export function formatCurrencyFull(amount) {
  if (amount === null || amount === undefined) return '$ 0'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(amount)
}

/**
 * Formatea una fecha en formato corto dd/mm/aaaa
 */
export function formatDate(dateString) {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
}

/**
 * Formatea una fecha en formato largo (ej: "21 de enero de 2026")
 */
export function formatDateLong(dateString) {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
}

/**
 * Formatea un timestamp con fecha y hora (ej: "21/01/2026 14:30")
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '-'
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

/**
 * Formatea hora relativa - si es hoy solo hora, sino fecha + hora
 */
export function formatTime(timestamp) {
  if (!timestamp) return '-'
  const fecha = new Date(timestamp)
  const hoy = new Date()
  const esHoy = fecha.toDateString() === hoy.toDateString()

  const hora = fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  if (esHoy) return hora

  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit'
  }) + ' ' + hora
}

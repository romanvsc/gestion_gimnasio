/**
 * Registro de errores del cliente sin volcar respuestas completas de APIs ni
 * datos personales en la consola de producción.
 */
const ERROR_REPORT_URL = import.meta.env?.VITE_ERROR_REPORT_URL || ''
const REPORT_BUDGET_KEY = 'yacyreta:client-error-report-count'
const MAX_REPORTS_PER_SESSION = 20

function normalizeCode(error) {
  const rawCode = error?.code || error?.status
  if (rawCode === undefined || rawCode === null) return undefined

  return String(rawCode).replace(/[^a-z0-9_-]/gi, '').slice(0, 64) || undefined
}

function getReportCount() {
  try {
    return Number.parseInt(sessionStorage.getItem(REPORT_BUDGET_KEY) || '0', 10) || 0
  } catch {
    return 0
  }
}

function consumeReportBudget() {
  const count = getReportCount()
  if (count >= MAX_REPORTS_PER_SESSION) return false

  try {
    sessionStorage.setItem(REPORT_BUDGET_KEY, String(count + 1))
  } catch {
    // Si el almacenamiento está bloqueado, el reporte sigue siendo opcional.
  }

  return true
}

function sendAggregatedReport(eventName, safeError) {
  if (!ERROR_REPORT_URL || typeof navigator === 'undefined' || !navigator.sendBeacon) return
  if (!consumeReportBudget()) return

  const payload = JSON.stringify({
    event: String(eventName).slice(0, 80),
    code: safeError.code,
    type: safeError.type,
    at: new Date().toISOString()
  })

  try {
    navigator.sendBeacon(
      ERROR_REPORT_URL,
      new Blob([payload], { type: 'application/json' })
    )
  } catch {
    // La observabilidad nunca debe interrumpir el flujo operativo.
  }
}

/**
 * Registra errores sin volcar respuestas completas de APIs ni datos
 * personales. En producción solo transmite un evento, tipo y código opcional;
 * el endpoint es opt-in mediante VITE_ERROR_REPORT_URL.
 */
export function reportClientError(eventName, error, context = {}) {
  const safeError = {
    code: normalizeCode(error),
    type: String(error?.name || 'Error').replace(/[^a-z0-9_-]/gi, '').slice(0, 64) || 'Error'
  }

  if (import.meta.env?.DEV) {
    console.error(`[${eventName}]`, {
      ...safeError,
      message: error?.message || 'Error desconocido'
    }, context)
    return
  }

  console.error(`[${eventName}]`, safeError)
  sendAggregatedReport(eventName, safeError)
}

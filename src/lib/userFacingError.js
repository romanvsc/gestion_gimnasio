import { UI_COPY } from '../config/uiCopy.js'

function getErrorText(error) {
  if (!error) return ''
  return [error.code, error.message, error.details, error.hint, error.constraint]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/**
 * Convierte errores de infraestructura en mensajes que ayudan a la persona a
 * resolver el problema. Los detalles originales solo quedan en observabilidad.
 */
export function toUserMessage(error, fallback = UI_COPY.errors.generic) {
  const text = getErrorText(error)

  if (/jwt|session|sesión|token|refresh|auth/.test(text)) return UI_COPY.errors.session
  if (/42501|permission|permis|row-level security|not authorized|unauthorized|forbidden/.test(text)) {
    return UI_COPY.errors.permission
  }
  if (/23505|duplicate key|unique constraint|already exists/.test(text)) return UI_COPY.errors.duplicate
  if (/23503|foreign key|related|relacionad/.test(text)) return UI_COPY.errors.relatedData
  if (/23p01|overlap|superpos/.test(text)) {
    return 'Este intervalo se superpone con otra jornada. Elegí un horario que no se cruce.'
  }
  if (/network|connection|timeout|failed to fetch|networkerror|abort|server error|\b5\d{2}\b/.test(text)) {
    return UI_COPY.errors.connection
  }
  if (/column .* does not exist|relation .* does not exist|schema|postgrest|supabase|sql|postgres/.test(text)) {
    return UI_COPY.errors.unavailable
  }

  const message = String(error?.message || '').trim()
  if (/^(El|La|Los|Las|No |Ya |Solo |Completá|Elegí|Ingresá|Seleccioná|Podés|Este |Tu )/i.test(message)) {
    return message
  }

  return fallback
}

export function getUserFacingError(error, fallback = UI_COPY.errors.generic) {
  return {
    message: toUserMessage(error, fallback),
    code: error?.code || 'unknown'
  }
}

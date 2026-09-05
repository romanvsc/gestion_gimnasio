/**
 * Nombres heredados que representaban el placeholder inicial del producto.
 *
 * Este servicio es deliberadamente puro: no conoce Vue, Supabase ni la marca
 * concreta. La política de fallback se inyecta desde la composición de la app.
 */
const LEGACY_PLACEHOLDER_NAMES = Object.freeze([
  '',
  'gimnasio',
  'ghost gym'
])

function normalize(value) {
  return String(value ?? '').trim()
}

/**
 * @param {string|null|undefined} configuredName
 * @param {string} fallbackName
 * @returns {string}
 */
export function normalizeGymName(configuredName, fallbackName) {
  const normalizedName = normalize(configuredName)

  if (LEGACY_PLACEHOLDER_NAMES.includes(normalizedName.toLowerCase())) {
    return fallbackName
  }

  return normalizedName
}

export { LEGACY_PLACEHOLDER_NAMES }

export const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024

export const LOGO_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg'

const SUPPORTED_LOGO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg'])
const SUPPORTED_LOGO_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml'
])

function getFileExtension(file) {
  return (file?.name || '').split('.').pop()?.toLowerCase() || ''
}

export function isSvgFile(file) {
  return file?.type?.toLowerCase() === 'image/svg+xml' || getFileExtension(file) === 'svg'
}

export function validateLogoFile(file) {
  if (!file) {
    return { valid: false, message: 'Seleccioná un archivo de logo' }
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return { valid: false, message: 'El logo no debe superar 5MB' }
  }

  const mimeType = file.type?.toLowerCase() || ''
  const extension = getFileExtension(file)
  const isSupported = SUPPORTED_LOGO_MIME_TYPES.has(mimeType) || SUPPORTED_LOGO_EXTENSIONS.has(extension)

  if (!isSupported) {
    return { valid: false, message: 'Formato no válido. Usa JPG, PNG, WEBP o SVG' }
  }

  return { valid: true }
}

export function getLogoUploadInfo(file) {
  if (isSvgFile(file)) {
    return {
      extension: 'svg',
      contentType: 'image/svg+xml',
      isVector: true
    }
  }

  return {
    extension: 'webp',
    contentType: 'image/webp',
    isVector: false
  }
}

// Los logos se sirven desde un bucket publico. Un SVG puede contener HTML,
// JavaScript o referencias externas, por lo que no alcanza con validar solo
// la extension y el MIME declarado por el navegador.
const UNSAFE_SVG_PATTERN = /<!doctype|<!entity|<script\b|<foreignObject\b|<iframe\b|<object\b|<embed\b|<audio\b|<video\b|\bon[a-z]+\s*=|(?:javascript|vbscript)\s*:|(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|\/\/|data:)|@import\b|url\s*\(\s*(?:https?:|\/\/|data:)/i

export function validateSvgContent(source) {
  const markup = String(source || '').trim()

  if (!/<svg(?:\s|>)/i.test(markup)) {
    return { valid: false, message: 'El SVG no contiene una raiz valida' }
  }

  if (UNSAFE_SVG_PATTERN.test(markup)) {
    return { valid: false, message: 'El SVG contiene contenido no permitido' }
  }

  return { valid: true }
}

export async function sanitizeSvgFile(file) {
  const content = await file.text()
  const validation = validateSvgContent(content)

  if (!validation.valid) {
    throw new Error(validation.message)
  }

  return new Blob([content], { type: 'image/svg+xml' })
}

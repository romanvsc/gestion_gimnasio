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

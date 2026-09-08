/**
 * Lleva el foco al primer control inválido de un formulario y lo deja visible.
 * La validación sigue siendo responsabilidad del formulario o del caso de uso;
 * esta utilidad solo mejora la orientación de la persona.
 */
export function focusFirstInvalid(container = document) {
  const firstInvalid = container?.querySelector?.(
    'input:invalid, select:invalid, textarea:invalid, [aria-invalid="true"]'
  )

  if (!firstInvalid) return null

  firstInvalid.focus({ preventScroll: true })
  firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
  return firstInvalid
}

/**
 * Los formularios nativos no siempre disparan `submit` cuando fallan las reglas
 * HTML. Escuchamos `invalid` en captura para aplicar el mismo foco en toda la UI.
 */
export function installInvalidFieldFocus() {
  let frameId = null

  function handleInvalid(event) {
    const form = event.target?.form
    if (!form || frameId !== null) return

    frameId = window.requestAnimationFrame(() => {
      frameId = null
      focusFirstInvalid(form)
    })
  }

  document.addEventListener('invalid', handleInvalid, true)

  return () => {
    document.removeEventListener('invalid', handleInvalid, true)
    if (frameId !== null) window.cancelAnimationFrame(frameId)
  }
}

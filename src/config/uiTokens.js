/**
 * Clases visuales semánticas compartidas por componentes de presentación.
 * Los valores cromáticos reales viven en tailwind.config.js/brand.js; aquí
 * solo se expresa la jerarquía de intención del estado.
 */
export const UI_TOKENS = Object.freeze({
  tones: Object.freeze({
    success: 'bg-success-100 text-success-800 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800',
    danger: 'bg-danger-100 text-danger-800 border-danger-200 dark:bg-danger-900/30 dark:text-danger-400 dark:border-danger-800',
    warning: 'bg-warning-100 text-warning-800 border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-800',
    info: 'bg-info-100 text-info-800 border-info-200 dark:bg-info-900/30 dark:text-info-400 dark:border-info-800',
    neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
  }),
  iconTones: Object.freeze({
    danger: 'bg-danger-100 dark:bg-danger-900/30',
    warning: 'bg-warning-100 dark:bg-warning-900/30',
    info: 'bg-info-100 dark:bg-info-900/30'
  }),
  iconTextTones: Object.freeze({
    danger: 'text-danger-600 dark:text-danger-400',
    warning: 'text-warning-600 dark:text-warning-400',
    info: 'text-info-600 dark:text-info-400'
  })
})

export const COLOR_SCALES = Object.freeze({
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  primary: {
    50: '#fff8f2',
    100: '#ffead9',
    200: '#ffd0ad',
    300: '#ffad73',
    400: '#ff8a00',
    500: '#ff6a00',
    600: '#ef3f0a',
    700: '#c92c08',
    800: '#a32506',
    900: '#721804',
    950: '#3f0b02'
  },
  secondary: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  }
})

export function colorToRgba(hex, alpha = 1) {
  const normalized = String(hex).replace('#', '')
  const expanded = normalized.length === 3
    ? normalized.split('').map(value => value + value).join('')
    : normalized
  const red = Number.parseInt(expanded.slice(0, 2), 16)
  const green = Number.parseInt(expanded.slice(2, 4), 16)
  const blue = Number.parseInt(expanded.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export const BRAND = Object.freeze({
  name: 'Yacyretá',
  displayName: 'YACYRETA',
  location: 'Ituzaingó, Corrientes',
  logoSrc: '/brand/yacyreta-logo.svg',
  logoAlt: 'Escudo del Club Social y Deportivo Yacyretá',
  colors: Object.freeze({
    primary: COLOR_SCALES.primary[600],
    primaryRgb: '239, 63, 10',
    primaryStrong: COLOR_SCALES.primary[700],
    success: COLOR_SCALES.success[600],
    danger: COLOR_SCALES.danger[600],
    warning: COLOR_SCALES.warning[600],
    info: COLOR_SCALES.info[600],
    dark: COLOR_SCALES.secondary[950],
    light: COLOR_SCALES.primary[50]
  })
})

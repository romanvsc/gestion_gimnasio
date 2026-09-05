import { COLOR_SCALES } from './src/config/brand.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Jerarquía semántica centralizada para la identidad de Yacyretá.
        neutral: COLOR_SCALES.neutral,
        gray: COLOR_SCALES.neutral,
        primary: COLOR_SCALES.primary,
        orange: COLOR_SCALES.primary,
        secondary: COLOR_SCALES.secondary,
        teal: COLOR_SCALES.secondary,
        success: COLOR_SCALES.success,
        emerald: COLOR_SCALES.success,
        danger: COLOR_SCALES.danger,
        red: COLOR_SCALES.danger,
        warning: COLOR_SCALES.warning,
        amber: COLOR_SCALES.warning,
        yellow: COLOR_SCALES.warning,
        info: COLOR_SCALES.info,
        blue: COLOR_SCALES.info,
        indigo: COLOR_SCALES.info,
        purple: COLOR_SCALES.secondary,
        page: {
          bg: 'var(--color-page-bg)',
          title: 'var(--color-page-title)',
          subtitle: 'var(--color-page-subtitle)',
          muted: 'var(--color-page-muted)',
          card: 'var(--color-page-card)',
          elevated: 'var(--color-page-elevated)',
          'card-hover': 'var(--color-page-card-hover)',
          border: 'var(--color-page-border)'
        }
      }
    }
  },
  plugins: []
}

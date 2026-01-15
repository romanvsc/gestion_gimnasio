/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
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
          950: '#020617',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Design System: Colores semánticos para páginas
        page: {
          bg: '#f8fafc',        // gray-50: Fondo de todas las páginas
          title: '#0f172a',      // gray-900: Títulos principales
          subtitle: '#64748b',   // gray-500: Subtítulos y descripciones
          muted: '#94a3b8',      // gray-400: Texto muy secundario
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilita modo oscuro con clase
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
        // ============================================
        // 🎨 PALETA WHITE LABEL - EDITAR AQUÍ PARA CAMBIAR MARCA
        // ============================================
        primary: {
          50: '#f4f0fa',
          100: '#e6def4',
          200: '#d0bfea',
          300: '#b499dd',
          400: '#9571ce',
          500: '#794ebd',
          600: '#5F388C', // <--- Color Principal de la marca
          700: '#562f7e',
          800: '#492969',
          900: '#3d2355',
          950: '#261239',
        },
        // Paleta secundaria para acentos (Cyan/Teal complementario)
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // <--- Color secundario principal
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // ============================================
        // Design System: Colores semánticos para páginas
        // Usan CSS variables para soportar dark mode automático
        page: {
          bg: 'var(--color-page-bg)',
          title: 'var(--color-page-title)',
          subtitle: 'var(--color-page-subtitle)',
          muted: 'var(--color-page-muted)',
          card: 'var(--color-page-card)',
          border: 'var(--color-page-border)',
        },
      },
    },
  },
  plugins: [],
}

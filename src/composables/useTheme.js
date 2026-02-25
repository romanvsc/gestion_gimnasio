import { ref, watch, readonly } from 'vue'

const STORAGE_KEY = 'gym-theme'

/** 
 * Valores posibles: 'light', 'dark', 'system'
 */
const themePreference = ref('light')
const isDark = ref(false)

let initialized = false

/**
 * Composable para manejar tema oscuro/claro.
 * Persiste la preferencia en localStorage.
 * Aplica la clase 'dark' en <html> para Tailwind darkMode: 'class'.
 */
export function useTheme() {
  if (!initialized) {
    init()
    initialized = true
  }

  function init() {
    // Leer preferencia guardada
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      themePreference.value = saved
    } else {
      themePreference.value = 'light'
    }

    applyTheme()

    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (themePreference.value === 'system') {
        applyTheme()
      }
    })
  }

  function applyTheme() {
    const html = document.documentElement
    
    if (themePreference.value === 'dark') {
      html.classList.add('dark')
      isDark.value = true
    } else if (themePreference.value === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.classList.toggle('dark', prefersDark)
      isDark.value = prefersDark
    } else {
      html.classList.remove('dark')
      isDark.value = false
    }

    // Actualizar meta theme-color para la barra del navegador/PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark.value ? '#0f172a' : '#5F388C')
    }
  }

  function setTheme(value) {
    themePreference.value = value
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme()
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    themePreference: readonly(themePreference),
    isDark: readonly(isDark),
    setTheme,
    toggleTheme
  }
}

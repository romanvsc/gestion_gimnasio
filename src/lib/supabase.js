import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ADVERTENCIA: ¡Faltan las credenciales de Supabase en el archivo .env!')
}

/**
 * Cliente Supabase configurado para conexiones móviles lentas
 * - Timeout de 15 segundos para queries
 * - Auto-refresh de tokens
 * - Persistencia de sesión
 * - Detección agresiva de fallos
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false, // Evitar conflictos con redirects
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Timeout de 15 segundos para evitar queries colgadas
    fetch: (url, options = {}) => {
      return fetch(url, { ...options, signal: AbortSignal.timeout(15000) })
    }
  }
})
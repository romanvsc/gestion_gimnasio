import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Cliente Supabase "fantasma" para crear usuarios sin afectar la sesión del admin.
 * Configurado con persistSession: false para evitar que interfiera con el login actual.
 */
export const supabaseGhost = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ADVERTENCIA: ¡Faltan las credenciales de Supabase en el archivo .env!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
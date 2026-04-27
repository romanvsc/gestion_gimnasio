import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ADVERTENCIA: ¡Faltan las credenciales de Supabase en el archivo .env!')
}

/**
 * Función fetch con reintentos para manejar cortes temporales de red
 * al volver a la PWA (ej: salir de standby, cambiar de WiFi a 4G).
 */
const fetchWithRetry = async (url, options = {}) => {
  const maxRetries = 4;
  const baseDelay = 1000;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Timeout agresivo para detectar rápidamente red colgada
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      
      // Solo reintentar en errores 5xx del servidor
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server Error: ${response.status}`);
      }
      return response;
    } catch (error) {
      attempt++;
      // Errores típicos de red desconectada al volver a la app
      const isNetworkError = 
        error.name === 'TypeError' || 
        error.message === 'Failed to fetch' || 
        error.name === 'AbortError' || 
        error.message?.includes('Server Error') ||
        error.message?.includes('NetworkError');

      if (attempt >= maxRetries || !isNetworkError) {
        throw error;
      }
      
      console.warn(`[Supabase Fetch] Fallo temporal de red. Intento ${attempt}/${maxRetries}. Reintentando en ${baseDelay * attempt}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, baseDelay * attempt));
    }
  }
}

/**
 * Cliente Supabase configurado para conexiones móviles lentas
 * - Fetch con reintentos automáticos
 * - Auto-refresh de tokens
 * - Persistencia de sesión
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false, // Evitar conflictos con redirects
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: fetchWithRetry
  }
})
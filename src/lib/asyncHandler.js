import { supabase } from '@/lib/supabase'

/**
 * Wrapper Maestro para Queries de Supabase
 * Maneja reintentos automáticos con backoff exponencial
 * Verifica conexión a internet y sesión antes de intentar
 * 
 * @param {Function} queryFn - Función que retorna una promesa de Supabase
 * @param {number} retries - Número de reintentos (default: 3)
 * @param {number} delay - Delay inicial en ms (default: 500ms)
 * @returns {Promise<any>} - Data de la query
 * @throws {Error} - Si fallan todos los reintentos
 */
export async function runQuery(queryFn, retries = 3, delay = 500) {
  try {
    // 1. CHECK DE CONEXIÓN: No intentar si no hay red
    if (!navigator.onLine) {
      throw new Error('Sin conexión a internet')
    }
    
    // 2. DESPERTAR SESIÓN: Forzar verificación de token antes de cualquier query
    // Esto "despierta" la conexión interna de Auth que puede estar dormida
    const { error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.warn('⚠️ Error de sesión, intentando refrescar...', authError)
      // Intentar refrescar el token
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) throw refreshError
    }
    
    // 3. EJECUTAR QUERY
    const result = await queryFn()
    
    // 4. SUPABASE devuelve errores como objeto, no como throw
    if (result.error) {
      throw result.error
    }
    
    // 5. RETORNAR DATA (puede ser null para RPC sin retorno)
    return result.data
  } catch (err) {
    // 6. REINTENTAR si quedan intentos
    if (retries > 0) {
      console.warn(`♻️ Reintentando petición... Quedan ${retries} intentos. Esperando ${delay}ms`)
      await new Promise(r => setTimeout(r, delay))
      // BACKOFF EXPONENCIAL: Duplicar delay en cada intento
      return runQuery(queryFn, retries - 1, delay * 2)
    }
    
    // 7. SI SE ACABARON LOS REINTENTOS, tirar error final
    console.error('❌ Falló la petición después de todos los reintentos:', err)
    throw err
  }
}

/**
 * Versión especial para queries que usan count
 * Supabase devuelve { count, error } en lugar de { data, error }
 */
export async function runCountQuery(queryFn, retries = 3, delay = 500) {
  try {
    if (!navigator.onLine) {
      throw new Error('Sin conexión a internet')
    }
    
    // DESPERTAR SESIÓN antes de la query
    const { error: authError } = await supabase.auth.getSession()
    if (authError) {
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) throw refreshError
    }
    
    const result = await queryFn()
    
    if (result.error) {
      throw result.error
    }
    
    return result.count
  } catch (err) {
    if (retries > 0) {
      console.warn(`♻️ Reintentando count query... Quedan ${retries} intentos. Esperando ${delay}ms`)
      await new Promise(r => setTimeout(r, delay))
      return runCountQuery(queryFn, retries - 1, delay * 2)
    }
    
    console.error('❌ Falló la count query después de todos los reintentos:', err)
    throw err
  }
}

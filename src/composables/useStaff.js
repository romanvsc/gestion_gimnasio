import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { supabaseGhost } from '@/lib/supabaseGhost'

export function useStaff() {
  const staffList = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Cargar lista de staff desde la tabla staff
   */
  const loadStaff = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      console.log('📊 Datos recibidos de Supabase:', data)
      staffList.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error cargando staff:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear nuevo usuario staff
   * Usa el cliente "fantasma" para no cerrar la sesión del admin
   */
  const createStaff = async ({ usuario, email, password, rol }) => {
    loading.value = true
    error.value = null
    try {
      // 1. Crear usuario en Auth usando el cliente fantasma
      const { data: authData, error: authError } = await supabaseGhost.auth.signUp({
        email,
        password,
        options: {
          data: {
            usuario,
            rol
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario en Auth')

      // 2. Insertar en tabla staff con el ID del usuario Auth
      const { error: insertError } = await supabase
        .from('staff')
        .insert([
          {
            id: authData.user.id,
            usuario,
            email,
            rol,
            activo: true
          }
        ])

      if (insertError) throw insertError

      // Recargar lista
      await loadStaff()
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Error creando staff:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar datos de staff (solo usuario y rol)
   * El email no se puede cambiar una vez creado
   */
  const updateStaff = async (id, { usuario, rol }) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('staff')
        .update({ usuario, rol })
        .eq('id', id)

      if (err) throw err

      // Recargar lista
      await loadStaff()
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Error actualizando staff:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Activar/Desactivar staff (soft delete)
   */
  const toggleStatus = async (id, currentStatus) => {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('staff')
        .update({ activo: !currentStatus })
        .eq('id', id)

      if (err) throw err

      // Recargar lista
      await loadStaff()
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Error cambiando estado de staff:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    staffList,
    loading,
    error,
    loadStaff,
    createStaff,
    updateStaff,
    toggleStatus
  }
}

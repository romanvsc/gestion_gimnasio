import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useMembers() {
  const members = ref([])
  const currentMember = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Obtiene todos los socios desde la vista v_socios_estado
   * Esta vista incluye el cálculo de estados (activo, vencido)
   */
  async function getMembers() {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('v_socios_estado')
        .select('*')
        .order('estado_cuota', { ascending: false }) // Vencidos primero
        .order('apellido', { ascending: true })

      if (fetchError) throw fetchError

      members.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener socios:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un socio por su ID desde la tabla members
   */
  async function getMemberById(id) {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      currentMember.value = data
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener socio:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo socio
   */
  async function createMember(memberData) {
    try {
      loading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single()

      if (createError) throw createError

      return { success: true, data }
    } catch (err) {
      console.error('Error al crear socio:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza un socio existente
   */
  async function updateMember(id, memberData) {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('members')
        .update(memberData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      currentMember.value = data
      return { success: true, data }
    } catch (err) {
      console.error('Error al actualizar socio:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un socio (opcional)
   */
  async function deleteMember(id) {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return { success: true }
    } catch (err) {
      console.error('Error al eliminar socio:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpia los errores
   */
  function clearError() {
    error.value = null
  }

  return {
    // Estado
    members,
    currentMember,
    loading,
    error,
    // Métodos
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    clearError
  }
}
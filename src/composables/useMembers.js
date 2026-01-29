import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { runQuery } from '@/lib/asyncHandler'
import imageCompression from 'browser-image-compression'
import { toast } from 'vue-sonner'

export function useMembers() {
  const members = ref([])
  const currentMember = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Traduce errores de Postgres a mensajes amigables
   */
  function translatePostgresError(err) {
    const message = err.message || ''
    const detail = err.detail || ''
    const code = err.code || ''
    const constraint = err.constraint || ''

    // Combinar todos los campos para búsqueda
    const fullError = `${message} ${detail} ${constraint}`.toLowerCase()

    // Error de constraint UNIQUE (código 23505)
    if (code === '23505' || fullError.includes('duplicate key') || fullError.includes('unique constraint') || fullError.includes('already exists')) {
      if (fullError.includes('dni') || fullError.includes('members_dni')) {
        return 'Ya existe un socio registrado con este DNI. Por favor, verifica el número ingresado.'
      }
      if (fullError.includes('email') || fullError.includes('members_email')) {
        return 'Ya existe un socio registrado con este email. Por favor, usa otro email.'
      }
      return 'Ya existe un registro con estos datos. Por favor, verifica la información ingresada.'
    }

    // Error de foreign key (código 23503)
    if (code === '23503' || fullError.includes('foreign key') || fullError.includes('violates foreign key')) {
      return 'No se puede completar la operación porque hay datos relacionados.'
    }

    // Error de conexión
    if (fullError.includes('network') || fullError.includes('connection') || fullError.includes('timeout')) {
      return 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.'
    }

    return message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'
  }

  /**
   * Verifica si existe un socio con el mismo DNI
   * @param {string} dni - DNI a verificar
   * @param {string|null} excludeId - ID del socio a excluir (para edición)
   * @returns {Promise<{exists: boolean, member?: object}>}
   */
  async function checkDuplicateDNI(dni, excludeId = null) {
    if (!dni) return { exists: false }

    try {
      let query = supabase
        .from('members')
        .select('id, nombre, apellido, dni')
        .eq('dni', dni.trim())

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error: err } = await query.maybeSingle()

      if (err) throw err

      return { exists: !!data, member: data }
    } catch (err) {
      console.error('Error verificando DNI duplicado:', err)
      return { exists: false, error: err.message }
    }
  }

  /**
   * Verifica si existe un socio con el mismo email
   * @param {string} email - Email a verificar
   * @param {string|null} excludeId - ID del socio a excluir (para edición)
   * @returns {Promise<{exists: boolean, member?: object}>}
   */
  async function checkDuplicateEmail(email, excludeId = null) {
    if (!email || !email.trim()) return { exists: false }

    try {
      let query = supabase
        .from('members')
        .select('id, nombre, apellido, email')
        .eq('email', email.trim().toLowerCase())

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error: err } = await query.maybeSingle()

      if (err) throw err

      return { exists: !!data, member: data }
    } catch (err) {
      console.error('Error verificando email duplicado:', err)
      return { exists: false, error: err.message }
    }
  }

  /**
   * Verifica si existe un socio con el mismo nombre y apellido
   * @param {string} nombre - Nombre a verificar
   * @param {string} apellido - Apellido a verificar
   * @param {string|null} excludeId - ID del socio a excluir (para edición)
   * @returns {Promise<{exists: boolean, member?: object}>}
   */
  async function checkDuplicateName(nombre, apellido, excludeId = null) {
    if (!nombre || !apellido) return { exists: false }

    try {
      let query = supabase
        .from('members')
        .select('id, nombre, apellido, dni')
        .ilike('nombre', nombre.trim())
        .ilike('apellido', apellido.trim())

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error: err } = await query.maybeSingle()

      if (err) throw err

      return { exists: !!data, member: data }
    } catch (err) {
      console.error('Error verificando nombre duplicado:', err)
      return { exists: false, error: err.message }
    }
  }

  /**
   * Verifica todos los posibles duplicados antes de crear/actualizar
   * @param {object} memberData - Datos del socio
   * @param {string|null} excludeId - ID a excluir (para edición)
   * @returns {Promise<{valid: boolean, errors: string[]}>}
   */
  async function validateNoDuplicates(memberData, excludeId = null) {
    const errors = []

    // Verificar DNI (obligatorio)
    const dniCheck = await checkDuplicateDNI(memberData.dni, excludeId)
    if (dniCheck.exists) {
      errors.push(`Ya existe un socio con DNI ${memberData.dni}: ${dniCheck.member.nombre} ${dniCheck.member.apellido}`)
    }

    // Verificar Email (si tiene)
    if (memberData.email) {
      const emailCheck = await checkDuplicateEmail(memberData.email, excludeId)
      if (emailCheck.exists) {
        errors.push(`Ya existe un socio con email ${memberData.email}: ${emailCheck.member.nombre} ${emailCheck.member.apellido}`)
      }
    }

    // Verificar Nombre + Apellido
    const nameCheck = await checkDuplicateName(memberData.nombre, memberData.apellido, excludeId)
    if (nameCheck.exists) {
      errors.push(`Ya existe un socio llamado ${memberData.nombre} ${memberData.apellido} (DNI: ${nameCheck.member.dni})`)
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Obtiene todos los socios desde la vista v_socios_estado
   * Esta vista incluye el cálculo de estados (activo, vencido)
   * @param {boolean} includeInactive - Si es true, incluye socios inactivos
   */
  async function getMembers(includeInactive = false) {
    try {
      loading.value = true
      error.value = null

      // El wrapper runQuery se encarga de: navigator.onLine, reintentos, backoff
      const data = await runQuery(() => {
        let query = supabase
          .from('v_socios_estado')
          .select('*')

        // Filtrar solo activos si includeInactive es false
        if (!includeInactive) {
          query = query.eq('activo', true)
        }

        return query
          .order('estado_cuota', { ascending: false }) // Vencidos primero
          .order('apellido', { ascending: true })
      })

      members.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener socios:', err)
      error.value = err.message
      toast.error('Error al cargar lista de socios: ' + err.message)
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

      const data = await runQuery(() =>
        supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single()
      )

      currentMember.value = data
      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener socio:', err)
      error.value = err.message
      toast.error('Error al cargar datos del socio: ' + err.message)
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

      const data = await runQuery(() =>
        supabase
          .from('members')
          .insert([memberData])
          .select()
          .single()
      )

      toast.success('Socio creado exitosamente')
      return { success: true, data }
    } catch (err) {
      console.error('Error al crear socio:', err)
      const friendlyError = translatePostgresError(err)
      error.value = friendlyError
      toast.error('Error al crear socio: ' + friendlyError)
      return { success: false, error: friendlyError }
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
      toast.success('Datos actualizados correctamente')
      return { success: true, data }
    } catch (err) {
      console.error('Error al actualizar socio:', err)
      const friendlyError = translatePostgresError(err)
      error.value = friendlyError
      toast.error('Error al actualizar socio: ' + friendlyError)
      return { success: false, error: friendlyError }
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

      toast.success('Socio eliminado correctamente')
      return { success: true }
    } catch (err) {
      console.error('Error al eliminar socio:', err)
      error.value = err.message
      toast.error('Error al eliminar socio: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sube un avatar al bucket de Storage con compresión
   * @param {File} file - Archivo de imagen
   * @param {string} memberId - ID del socio
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async function uploadAvatar(file, memberId) {
    try {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen')
      }

      // Comprimir imagen
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true
      }

      const compressedFile = await imageCompression(file, options)

      // Generar nombre único
      const timestamp = Date.now()
      const fileName = `${memberId}_${timestamp}.jpg`

      // Subir a Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedFile, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return { success: true, url: publicUrl }
    } catch (err) {
      console.error('Error al subir avatar:', err)
      toast.error('Error al subir imagen: ' + err.message)
      return { success: false, error: err.message }
    }
  }

  /**
   * Elimina un avatar del bucket de Storage
   * @param {string} avatarUrl - URL completa del avatar
   * @returns {Promise<{success: boolean}>}
   */
  async function deleteAvatar(avatarUrl) {
    try {
      if (!avatarUrl) return { success: true }

      // Extraer el nombre del archivo de la URL
      const urlParts = avatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // Eliminar del bucket
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName])

      if (deleteError) {
        console.error('Error al eliminar avatar:', deleteError)
        // No lanzar error, solo log (puede que el archivo ya no exista)
      }

      return { success: true }
    } catch (err) {
      console.error('Error al eliminar avatar:', err)
      toast.error('Error al borrar imagen anterior: ' + err.message)
      return { success: false, error: err.message }
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
    uploadAvatar,
    deleteAvatar,
    clearError,
    // Validaciones de duplicados
    checkDuplicateDNI,
    checkDuplicateEmail,
    checkDuplicateName,
    validateNoDuplicates
  }
}
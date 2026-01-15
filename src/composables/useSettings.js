import { reactive, readonly } from 'vue'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'
import { toast } from 'vue-sonner'

// Estado reactivo global compartido (Singleton)
const state = reactive({
  settings: {
    id: 1,
    nombre_gimnasio: 'Gimnasio',
    email_contacto: '',
    whatsapp: '',
    horarios_apertura: '',
    logo_url: null
  },
  loading: false,
  error: null
})

export function useSettings() {
  /**
   * Obtiene la configuración global del gimnasio
   * Solo existe una fila con ID = 1
   */
  async function fetchSettings() {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await supabase
        .from('config')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) throw error

      if (data) {
        // Actualizar el estado reactivo
        Object.assign(state.settings, data)
      }

      return { success: true, data }
    } catch (err) {
      console.error('Error al obtener configuración:', err)
      state.error = err.message
      return { success: false, error: err.message }
    } finally {
      state.loading = false
    }
  }

  /**
   * Actualiza la configuración del gimnasio
   * @param {Object} formData - Datos del formulario (nombre_gimnasio, email_contacto, etc)
   */
  async function updateSettings(formData) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await supabase
        .from('config')
        .update({
          nombre_gimnasio: formData.nombre_gimnasio,
          email_contacto: formData.email_contacto,
          whatsapp: formData.whatsapp,
          horarios_apertura: formData.horarios_apertura
        })
        .eq('id', 1)
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local inmediatamente (optimistic update)
      Object.assign(state.settings, data)

      return { success: true, data }
    } catch (err) {
      console.error('Error al actualizar configuración:', err)
      state.error = err.message
      throw err
    } finally {
      state.loading = false
    }
  }

  /**
   * Sube un nuevo logo al bucket 'config' y actualiza la URL en la DB
   * @param {File} file - Archivo de imagen seleccionado
   */
  async function uploadLogo(file) {
    try {
      state.loading = true
      state.error = null

      // 1. Comprimir la imagen
      const options = {
        maxSizeMB: 0.2, // 200KB máximo
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/webp'
      }

      const compressedFile = await imageCompression(file, options)
      
      // 2. Generar nombre único
      const fileName = `logo-${Date.now()}.webp`

      // 3. Si existe logo anterior, borrarlo del bucket
      if (state.settings.logo_url) {
        try {
          // Extraer el nombre del archivo del URL
          const oldFileName = state.settings.logo_url.split('/').pop().split('?')[0]
          const { error: deleteError } = await supabase.storage
            .from('config')
            .remove([oldFileName])
          
          if (deleteError) {
            console.warn('Error al borrar logo anterior:', deleteError)
          }
        } catch (err) {
          console.warn('Error al procesar eliminación de logo anterior:', err)
        }
      }

      // 4. Subir nuevo logo
      const { error: uploadError } = await supabase.storage
        .from('config')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 5. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('config')
        .getPublicUrl(fileName)

      // 6. Actualizar la URL en la tabla config
      const { data, error: updateError } = await supabase
        .from('config')
        .update({ logo_url: publicUrl })
        .eq('id', 1)
        .select()
        .single()

      if (updateError) throw updateError

      // 7. Actualizar estado local
      state.settings.logo_url = publicUrl

      return { success: true, data }
    } catch (err) {
      console.error('Error al subir logo:', err)
      state.error = err.message
      throw err
    } finally {
      state.loading = false
    }
  }

  /**
   * Elimina el logo actual del bucket y de la DB
   */
  async function deleteLogo() {
    try {
      state.loading = true
      state.error = null

      if (!state.settings.logo_url) {
        throw new Error('No hay logo para eliminar')
      }

      // 1. Extraer nombre del archivo
      const fileName = state.settings.logo_url.split('/').pop().split('?')[0]

      // 2. Borrar del bucket
      const { error: deleteError } = await supabase.storage
        .from('config')
        .remove([fileName])

      if (deleteError) throw deleteError

      // 3. Actualizar DB (logo_url = null)
      const { error: updateError } = await supabase
        .from('config')
        .update({ logo_url: null })
        .eq('id', 1)

      if (updateError) throw updateError

      // 4. Actualizar estado local
      state.settings.logo_url = null

      return { success: true }
    } catch (err) {
      console.error('Error al eliminar logo:', err)
      state.error = err.message
      throw err
    } finally {
      state.loading = false
    }
  }

  return {
    // Estado reactivo de solo lectura (prevenir mutaciones externas)
    settings: readonly(state.settings),
    loading: readonly(state.loading),
    error: readonly(state.error),
    
    // Métodos
    fetchSettings,
    updateSettings,
    uploadLogo,
    deleteLogo
  }
}

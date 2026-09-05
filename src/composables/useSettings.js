import { reactive, readonly } from 'vue'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'
import { toast } from 'vue-sonner'
import { BRAND } from '@/config/brand'
import { getLogoUploadInfo, sanitizeSvgFile, validateLogoFile } from '@/utils/logoUpload'
import { normalizeGymName } from '@/contexts/gym-identity-config/domain/services/normalizeGymName.js'
import { reportClientError } from '@/lib/observability'

// Estado reactivo global compartido (Singleton)
const state = reactive({
  settings: {
    id: 1,
    nombre_gimnasio: BRAND.name,
    email_contacto: '',
    whatsapp: '',
    horarios_apertura: '',
    logo_url: null
  },
  loading: false,
  error: null
})

const PUBLIC_CONFIG_FIELDS = 'id, nombre_gimnasio, logo_url'
const AUTHENTICATED_CONFIG_FIELDS = 'id, nombre_gimnasio, email_contacto, whatsapp, horarios_apertura, direccion, created_at, logo_url'
const SETTINGS_FETCH_TIMEOUT_MS = 8000

function withTimeout(promise, timeoutMs, message) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
}

export function useSettings() {
  /**
   * Obtiene la configuración global del gimnasio
   * Solo existe una fila con ID = 1
   */
  async function fetchSettings() {
    try {
      state.loading = true
      state.error = null

      // Antes de autenticarse, LoginView solo necesita identidad visual. Pedir
      // las columnas públicas explícitas evita depender de privilegios de
      // tabla demasiado amplios para el rol anon.
      const { data: { session } = {} } = await withTimeout(
        supabase.auth.getSession(),
        SETTINGS_FETCH_TIMEOUT_MS,
        'La configuración tardó demasiado en responder.'
      )
      const configFields = session
        ? AUTHENTICATED_CONFIG_FIELDS
        : PUBLIC_CONFIG_FIELDS

      const { data, error } = await withTimeout(
        supabase
          .from('config')
          .select(configFields)
          .eq('id', 1)
          .single(),
        SETTINGS_FETCH_TIMEOUT_MS,
        'La configuración tardó demasiado en responder.'
      )

      if (error) throw error

      if (data) {
        Object.assign(state.settings, {
          ...data,
          // Mantener la identidad de marca si la configuración aún conserva
          // un placeholder heredado. La migración persistente se ejecuta por
          // separado para no mezclar lectura con escritura de configuración.
          nombre_gimnasio: normalizeGymName(data.nombre_gimnasio, BRAND.name)
        })
      }

      return { success: true, data }
    } catch (err) {
      reportClientError('settings.fetch', err)
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
        .select(AUTHENTICATED_CONFIG_FIELDS)
        .single()

      if (error) throw error

      // Actualizar estado local inmediatamente (optimistic update)
      Object.assign(state.settings, data)

      return { success: true, data }
    } catch (err) {
      reportClientError('settings.update', err)
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

      const validation = validateLogoFile(file)
      if (!validation.valid) throw new Error(validation.message)

      const uploadInfo = getLogoUploadInfo(file)
      // Los SVG se conservan intactos; las imágenes raster siguen optimizándose.
      const fileToUpload = uploadInfo.isVector
        ? await sanitizeSvgFile(file)
        : await imageCompression(file, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 800,
            useWebWorker: true,
            fileType: 'image/webp'
          })
      
      // 2. Generar nombre único respetando el formato vectorial
      const fileName = `logo-${Date.now()}.${uploadInfo.extension}`

      // 3. Si existe logo anterior, borrarlo del bucket
      if (state.settings.logo_url) {
        try {
          // Extraer el nombre del archivo del URL
          const oldFileName = state.settings.logo_url.split('/').pop().split('?')[0]
          const { error: deleteError } = await supabase.storage
            .from('config')
            .remove([oldFileName])
          
          if (deleteError) {
            reportClientError('settings.logo_cleanup', deleteError)
          }
        } catch (err) {
          reportClientError('settings.logo_cleanup', err)
        }
      }

      // 4. Subir nuevo logo
      const { error: uploadError } = await supabase.storage
        .from('config')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          contentType: uploadInfo.contentType,
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
        .select(AUTHENTICATED_CONFIG_FIELDS)
        .single()

      if (updateError) throw updateError

      // 7. Actualizar estado local
      state.settings.logo_url = publicUrl

      return { success: true, data }
    } catch (err) {
      reportClientError('settings.logo_upload', err)
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
      reportClientError('settings.logo_delete', err)
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

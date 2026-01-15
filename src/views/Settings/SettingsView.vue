<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-3xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">Configuración del Sistema</h1>
        <p class="text-page-subtitle">Personaliza la información y apariencia de tu gimnasio</p>
      </div>

      <!-- Tarjeta de Configuración -->
      <div class="bg-white rounded-lg shadow-md p-6 md:p-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent mb-4"></div>
            <p class="text-gray-600">Cargando configuración...</p>
          </div>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="handleSave" class="space-y-6">
          <!-- Logo Institucional -->
          <div class="pb-6 border-b border-gray-200">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Logo Institucional
            </label>
            <p class="text-sm text-gray-500 mb-4">
              Sube el logo de tu gimnasio. Se mostrará en el menú y pantalla de inicio.
            </p>

            <!-- Preview del Logo Actual -->
            <div v-if="formData.logo_url" class="mb-4">
              <div class="inline-block relative">
                <img 
                  :src="formData.logo_url" 
                  :alt="formData.nombre_gimnasio"
                  class="max-h-32 max-w-xs object-contain rounded-lg border border-gray-200 p-2 bg-white"
                >
                <button
                  type="button"
                  @click="handleDeleteLogo"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Eliminar logo"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Input de Archivo -->
            <div class="flex items-center gap-4">
              <label
                class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload class="w-4 h-4" />
                <span>{{ formData.logo_url ? 'Cambiar Logo' : 'Subir Logo' }}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  @change="handleLogoUpload"
                  class="hidden"
                  :disabled="uploadingLogo"
                >
              </label>
              <span v-if="uploadingLogo" class="text-sm text-gray-600 flex items-center gap-2">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"></div>
                Subiendo...
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Formatos: JPG, PNG, WEBP. Tamaño máximo: 5MB
            </p>
          </div>

          <!-- Nombre del Gimnasio -->
          <div>
            <BaseInput
              v-model="formData.nombre_gimnasio"
              label="Nombre del Gimnasio"
              type="text"
              placeholder="Ej: Gimnasio FitZone"
              required
              :maxlength="100"
            />
            <p class="text-xs text-gray-500 mt-1">
              Este nombre se mostrará en el menú y en documentos
            </p>
          </div>

          <!-- Email de Contacto -->
          <div>
            <BaseInput
              v-model="formData.email_contacto"
              label="Email de Contacto"
              type="email"
              placeholder="contacto@gimnasio.com"
              :maxlength="100"
            />
            <p class="text-xs text-gray-500 mt-1">
              Email para recibir notificaciones y consultas
            </p>
          </div>

          <!-- WhatsApp -->
          <div>
            <BaseInput
              v-model="formData.whatsapp"
              label="WhatsApp"
              type="tel"
              placeholder="+54 9 11 1234-5678"
              :maxlength="50"
            />
            <p class="text-xs text-gray-500 mt-1">
              Número de contacto para consultas rápidas
            </p>
          </div>

          <!-- Horarios de Apertura -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Horarios de Apertura
            </label>
            <textarea
              v-model="formData.horarios_apertura"
              rows="4"
              placeholder="Ej:&#10;Lunes a Viernes: 6:00 - 22:00&#10;Sábados: 8:00 - 20:00&#10;Domingos: 9:00 - 14:00"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              maxlength="500"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              Especifica los horarios de atención de tu gimnasio
            </p>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <BaseButton
              type="button"
              variant="secondary"
              @click="router.push({ name: 'Dashboard' })"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="!isFormValid || saving"
            >
              <span v-if="!saving" class="flex items-center gap-2">
                <Save class="w-4 h-4" />
                Guardar Cambios
              </span>
              <span v-else class="flex items-center gap-2">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                Guardando...
              </span>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useSettings } from '@/composables/useSettings'
import { confirmAlert } from '@/lib/alerts'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { Upload, X, Save } from 'lucide-vue-next'

const router = useRouter()
const { settings, loading, fetchSettings, updateSettings, uploadLogo, deleteLogo } = useSettings()

const formData = reactive({
  nombre_gimnasio: '',
  email_contacto: '',
  whatsapp: '',
  horarios_apertura: '',
  logo_url: null
})

const saving = ref(false)
const uploadingLogo = ref(false)

const isFormValid = computed(() => {
  return formData.nombre_gimnasio.trim().length > 0
})

onMounted(async () => {
  await fetchSettings()
  
  // Copiar datos al formulario
  Object.assign(formData, {
    nombre_gimnasio: settings.nombre_gimnasio || '',
    email_contacto: settings.email_contacto || '',
    whatsapp: settings.whatsapp || '',
    horarios_apertura: settings.horarios_apertura || '',
    logo_url: settings.logo_url || null
  })
})

/**
 * Maneja la subida del logo
 */
async function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('El logo no debe superar 5MB')
    event.target.value = '' // Limpiar input
    return
  }

  // Validar formato
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!validTypes.includes(file.type)) {
    toast.error('Formato no válido. Usa JPG, PNG o WEBP')
    event.target.value = ''
    return
  }

  uploadingLogo.value = true

  try {
    await toast.promise(
      uploadLogo(file),
      {
        loading: 'Subiendo logo...',
        success: 'Logo actualizado correctamente',
        error: 'Error al subir el logo'
      }
    )

    // Actualizar formData con la nueva URL
    formData.logo_url = settings.logo_url
  } catch (err) {
    console.error('Error al subir logo:', err)
  } finally {
    uploadingLogo.value = false
    event.target.value = '' // Limpiar input para permitir re-subir
  }
}

/**
 * Elimina el logo actual
 */
async function handleDeleteLogo() {
  const confirmed = await confirmAlert(
    'Eliminar Logo',
    '¿Estás seguro de que deseas eliminar el logo actual?'
  )

  if (!confirmed) return

  try {
    await toast.promise(
      deleteLogo(),
      {
        loading: 'Eliminando logo...',
        success: 'Logo eliminado correctamente',
        error: 'Error al eliminar el logo'
      }
    )

    formData.logo_url = null
  } catch (err) {
    console.error('Error al eliminar logo:', err)
  }
}

/**
 * Guarda los cambios de configuración
 */
async function handleSave() {
  if (!isFormValid.value) return

  saving.value = true

  try {
    await toast.promise(
      updateSettings({
        nombre_gimnasio: formData.nombre_gimnasio.trim(),
        email_contacto: formData.email_contacto.trim(),
        whatsapp: formData.whatsapp.trim(),
        horarios_apertura: formData.horarios_apertura.trim()
      }),
      {
        loading: 'Guardando cambios...',
        success: 'Configuración actualizada correctamente',
        error: 'Error al guardar la configuración'
      }
    )

    // Opcional: Redirigir al dashboard
    // router.push({ name: 'Dashboard' })
  } catch (err) {
    console.error('Error al guardar configuración:', err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <BaseButton variant="ghost" @click="goBack">
          ← Volver
        </BaseButton>
      </div>

      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">
          {{ isEditing ? 'Editar Socio' : 'Nuevo Socio' }}
        </h1>
        <p class="text-page-subtitle">
          {{ isEditing ? 'Actualiza la información del socio' : 'Completa el formulario para agregar un nuevo socio' }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading && isEditing" class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">Cargando datos del socio...</p>
      </div>

      <!-- Formulario -->
      <div v-else class="bg-white rounded-lg shadow">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-8">
          
          <!-- SECCIÓN 1: Datos Personales & Foto -->
          <div class="border-b border-gray-200 pb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Datos Personales & Foto</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Columna 1: Foto de Perfil -->
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Foto de Perfil
                </label>
                <div class="flex flex-col items-center">
                  <!-- Preview de la foto -->
                  <div class="relative mb-4">
                    <div v-if="photoPreview" class="relative">
                      <img
                        :src="photoPreview"
                        alt="Preview"
                        class="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                      />
                      <button
                        v-if="!uploadingPhoto"
                        type="button"
                        @click="removePhoto"
                        class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                    <div v-else class="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <User class="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                  
                  <!-- Botón para subir foto -->
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleFileChange"
                    class="hidden"
                  />
                  <BaseButton
                    type="button"
                    color="secondary"
                    size="sm"
                    @click="$refs.fileInput.click()"
                    :disabled="uploadingPhoto"
                  >
                    <Upload class="w-4 h-4 mr-2" />
                    {{ photoPreview ? 'Cambiar Foto' : 'Subir Foto' }}
                  </BaseButton>
                  
                  <p v-if="uploadingPhoto" class="text-xs text-gray-500 mt-2">
                    Subiendo foto...
                  </p>
                  <p v-else class="text-xs text-gray-500 mt-2">
                    JPG, PNG o WebP (máx. 2MB)
                  </p>
                </div>
              </div>

              <!-- Columna 2 y 3: Datos Personales -->
              <div class="md:col-span-2 space-y-4">
                <!-- Nombre y Apellido -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BaseInput
                    v-model="formData.nombre"
                    label="Nombre *"
                    placeholder="Juan"
                    required
                  />
                  <BaseInput
                    v-model="formData.apellido"
                    label="Apellido *"
                    placeholder="Pérez"
                    required
                  />
                </div>

                <!-- DNI y Fecha de Nacimiento -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BaseInput
                    v-model="formData.dni"
                    type="text"
                    label="DNI *"
                    placeholder="12345678"
                    required
                  />
                  <BaseInput
                    v-model="formData.fecha_nacimiento"
                    type="date"
                    label="Fecha de Nacimiento"
                  />
                </div>

                <!-- Email y Teléfono -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BaseInput
                    v-model="formData.email"
                    type="email"
                    label="Email"
                    placeholder="juan@example.com"
                  />
                  <BaseInput
                    v-model="formData.telefono"
                    type="tel"
                    label="Teléfono"
                    placeholder="11-1234-5678"
                  />
                </div>

                <!-- Fecha de Alta -->
                <BaseInput
                  v-model="formData.fecha_alta"
                  type="date"
                  label="Fecha de Alta"
                  hint="Fecha en que el socio se registró en el gimnasio"
                />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 2: Salud (Datos Físicos) -->
          <div class="border-b border-gray-200 pb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Salud & Datos Físicos</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Peso y Altura -->
              <BaseInput
                v-model.number="formData.peso"
                type="number"
                step="0.1"
                min="0"
                max="300"
                label="Peso (kg)"
                placeholder="75.5"
              />
              <BaseInput
                v-model.number="formData.altura"
                type="number"
                step="0.01"
                min="0"
                max="3"
                label="Altura (m)"
                placeholder="1.75"
              />
              
              <!-- IMC Calculado -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  IMC (Índice de Masa Corporal)
                </label>
                <div class="relative">
                  <input
                    type="text"
                    :value="imcDisplay"
                    readonly
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                  />
                  <div v-if="imc" class="absolute right-3 top-1/2 -translate-y-1/2">
                    <span :class="[
                      'inline-flex h-3 w-3 rounded-full',
                      imcColor
                    ]"></span>
                  </div>
                </div>
                <p v-if="imc" :class="['text-xs mt-1', imcTextColor]">
                  {{ imcCategory }}
                </p>
                <p v-if="imcWarning" class="text-xs mt-1 text-yellow-600">
                  ⚠️ Verifique los datos ingresados
                </p>
              </div>
            </div>

            <!-- Apto Físico -->
            <div class="mt-4">
              <BaseInput
                v-model="formData.apto_fisico"
                type="date"
                label="Fecha de Vencimiento del Apto Físico"
                hint="Fecha hasta la cual es válido el apto médico"
              />
            </div>
          </div>

          <!-- SECCIÓN 3: Membresía y Estado -->
          <div class="pb-4">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Membresía y Estado</h2>
            
            <div class="space-y-6">
              <!-- Switch: Es Socio del Club -->
              <div class="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex-1">
                  <label class="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="formData.es_socio_club"
                      class="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span>¿Es Socio del Club?</span>
                    <span class="text-yellow-600">⭐</span>
                  </label>
                  <p class="text-xs text-gray-600 mt-1 ml-7">
                    Aplica tarifa preferencial en los planes
                  </p>
                </div>
              </div>

              <!-- Select: Plan Asociado -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Plan Asociado
                </label>
                <select
                  v-model="formData.plan_id"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option :value="null">Sin plan fijo (elegir al pagar)</option>
                  <option
                    v-for="plan in plans"
                    :key="plan.id"
                    :value="plan.id"
                  >
                    {{ plan.nombre }} - ${{ formData.es_socio_club ? plan.precio_socio : plan.precio }} ({{ plan.dias_duracion }} días)
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  El plan se pre-seleccionará automáticamente al registrar pagos
                </p>
              </div>

              <!-- Switch: Activo/Inactivo -->
              <div class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div class="flex-1">
                  <label class="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="formData.activo"
                      class="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span>Socio Activo</span>
                  </label>
                  <p class="text-xs text-gray-600 mt-1 ml-7">
                    Los socios inactivos no pueden hacer check-in
                  </p>
                </div>
                <StatusBadge :type="formData.activo ? 'success' : 'secondary'">
                  {{ formData.activo ? 'Activo' : 'Inactivo' }}
                </StatusBadge>
              </div>
            </div>
          </div>

          <!-- Error general -->
          <div 
            v-if="error" 
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {{ error }}
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <BaseButton
              type="submit"
              color="primary"
              :disabled="loading || uploadingPhoto"
            >
              <span v-if="loading">Guardando...</span>
              <span v-else>{{ isEditing ? 'Actualizar' : 'Guardar' }}</span>
            </BaseButton>

            <BaseButton
              type="button"
              color="secondary"
              @click="goBack"
              :disabled="loading || uploadingPhoto"
            >
              Cancelar
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { useMembers } from '@/composables/useMembers'
import { useParameters } from '@/composables/useParameters'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { User, Upload, X } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { loading, error, getMemberById, createMember, updateMember, uploadAvatar, deleteAvatar } = useMembers()
const { plans, fetchParameters } = useParameters()

const isEditing = computed(() => !!route.params.id)

const formData = ref({
  nombre: '',
  apellido: '',
  dni: '',
  fecha_nacimiento: '',
  fecha_alta: new Date().toISOString().split('T')[0], // Hoy por defecto
  email: '',
  telefono: '',
  peso: null,
  altura: null,
  apto_fisico: '',
  es_socio_club: false,
  plan_id: null,
  activo: true,
  foto_url: ''
})

// Estado para foto
const photoPreview = ref('')
const photoFile = ref(null)
const uploadingPhoto = ref(false)
const fileInput = ref(null)
const previousPhotoUrl = ref('')

// Calcular IMC
const imc = computed(() => {
  if (formData.value.peso && formData.value.altura && formData.value.altura > 0) {
    const valor = formData.value.peso / (formData.value.altura * formData.value.altura)
    return valor
  }
  return null
})

const imcDisplay = computed(() => {
  return imc.value ? imc.value.toFixed(2) : '-'
})

const imcCategory = computed(() => {
  if (!imc.value) return ''
  if (imc.value < 18.5) return 'Bajo peso'
  if (imc.value < 25) return 'Peso normal'
  if (imc.value < 30) return 'Sobrepeso'
  return 'Obesidad'
})

const imcColor = computed(() => {
  if (!imc.value) return 'bg-gray-300'
  if (imc.value < 18.5) return 'bg-yellow-400'
  if (imc.value < 25) return 'bg-green-500'
  if (imc.value < 30) return 'bg-orange-400'
  return 'bg-red-500'
})

const imcTextColor = computed(() => {
  if (!imc.value) return 'text-gray-600'
  if (imc.value < 18.5) return 'text-yellow-700'
  if (imc.value < 25) return 'text-green-700'
  if (imc.value < 30) return 'text-orange-700'
  return 'text-red-700'
})

const imcWarning = computed(() => {
  return imc.value && (imc.value < 15 || imc.value > 40)
})

// Manejo de foto
function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validar tipo
  if (!file.type.startsWith('image/')) {
    toast.error('Solo se permiten archivos de imagen', { duration: 3000 })
    return
  }

  // Validar tamaño (2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('La imagen no debe superar 2MB', { duration: 3000 })
    return
  }

  // Guardar archivo y mostrar preview
  photoFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removePhoto() {
  photoFile.value = null
  photoPreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  // Si estamos editando, marcamos para eliminar
  if (isEditing.value && formData.value.foto_url) {
    formData.value.foto_url = ''
  }
}

async function handleSubmit() {
  // Validación básica
  if (!formData.value.nombre.trim() || !formData.value.apellido.trim() || !formData.value.dni) {
    toast.error('Complete los campos obligatorios', { duration: 3000 })
    return
  }

  try {
    let memberData = { ...formData.value }
    
    // Si hay que subir una foto
    if (photoFile.value) {
      uploadingPhoto.value = true
      
      // Si estamos editando y ya tenía foto, eliminar la anterior
      if (isEditing.value && previousPhotoUrl.value) {
        await deleteAvatar(previousPhotoUrl.value)
      }
      
      // Generar ID temporal si estamos creando (usaremos el dni como identificador único)
      const memberId = isEditing.value ? route.params.id : formData.value.dni
      
      const uploadResult = await uploadAvatar(photoFile.value, memberId)
      
      if (uploadResult.success) {
        memberData.foto_url = uploadResult.url
      } else {
        toast.error('Error al subir la foto: ' + uploadResult.error, { duration: 5000 })
        uploadingPhoto.value = false
        return
      }
      
      uploadingPhoto.value = false
    } else if (!photoPreview.value && previousPhotoUrl.value) {
      // Si se eliminó la foto existente
      await deleteAvatar(previousPhotoUrl.value)
      memberData.foto_url = null
    }

    // Crear o actualizar
    const result = isEditing.value
      ? await updateMember(route.params.id, memberData)
      : await createMember(memberData)

    if (result.success) {
      toast.success(isEditing.value ? 'Socio actualizado correctamente' : 'Socio creado correctamente', { duration: 2000 })
      router.push({ name: 'Members' })
    } else {
      toast.error('Error al guardar: ' + result.error, { duration: 5000 })
    }
  } catch (err) {
    toast.error('Error inesperado: ' + err.message, { duration: 5000 })
  }
}

function goBack() {
  router.push({ name: 'Members' })
}

onMounted(async () => {
  // Cargar planes
  await fetchParameters()
  
  // Si estamos editando, cargar datos del socio
  if (isEditing.value) {
    const result = await getMemberById(route.params.id)
    if (result.success) {
      formData.value = { ...formData.value, ...result.data }
      
      // Si tiene foto, mostrar preview
      if (formData.value.foto_url) {
        photoPreview.value = formData.value.foto_url
        previousPhotoUrl.value = formData.value.foto_url
      }
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <!-- Header con botón volver -->
      <div class="mb-6">
        <BaseButton variant="ghost" @click="goBack" class="mb-4">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Volver
        </BaseButton>
        
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">
          {{ isEditing ? 'Editar Socio' : 'Nuevo Socio' }}
        </h1>
        <p class="text-page-subtitle">
          {{ isEditing ? 'Actualiza la información del socio' : 'Completa el formulario para agregar un nuevo socio' }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading && isEditing" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="animate-pulse">
          <div class="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
        <p class="text-gray-500 mt-4">Cargando datos del socio...</p>
      </div>

      <!-- Formulario -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        
        <!-- SECCIÓN 1: Datos Personales & Foto -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User class="w-5 h-5 text-primary-500" />
            Datos Personales & Foto
          </h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Columna 1: Foto de Perfil -->
            <div class="lg:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Foto de Perfil
              </label>
              <div class="flex flex-col items-center">
                <!-- Preview de la foto -->
                <div class="relative mb-4">
                  <div v-if="photoPreview" class="relative">
                    <img
                      :src="photoPreview"
                      alt="Preview"
                      class="w-32 h-32 rounded-full object-cover border-4 border-primary-100 shadow-md"
                    />
                    <button
                      v-if="!uploadingPhoto"
                      type="button"
                      @click="removePhoto"
                      class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md touch-manipulation"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                  <div v-else class="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <UserCircle class="w-16 h-16 text-gray-300" />
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
                  variant="outline"
                  size="md"
                  @click="$refs.fileInput.click()"
                  :disabled="uploadingPhoto"
                >
                  <Upload class="w-4 h-4 mr-2" />
                  {{ uploadingPhoto ? 'Subiendo...' : (photoPreview ? 'Cambiar Foto' : 'Subir Foto') }}
                </BaseButton>
                
                <p class="text-xs text-gray-500 mt-2 text-center">
                  JPG, PNG o WebP (máx. 2MB)
                </p>
              </div>
            </div>

            <!-- Columna 2 y 3: Datos Personales -->
            <div class="lg:col-span-2 space-y-4">
              <!-- Nombre y Apellido -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput
                  v-model="formData.nombre"
                  label="Nombre *"
                  placeholder="Juan"
                  size="lg"
                  required
                />
                <BaseInput
                  v-model="formData.apellido"
                  label="Apellido *"
                  placeholder="Pérez"
                  size="lg"
                  required
                />
              </div>

              <!-- DNI y Fecha de Nacimiento -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput
                  v-model="formData.dni"
                  type="text"
                  label="DNI"
                  placeholder="12345678"
                  size="lg"
                />
                <BaseInput
                  v-model="formData.fecha_nacimiento"
                  type="date"
                  label="Fecha de Nacimiento"
                  size="lg"
                />
              </div>

              <!-- Email y Teléfono -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput
                  v-model="formData.email"
                  type="email"
                  label="Email"
                  placeholder="juan@example.com"
                  size="lg"
                />
                <BaseInput
                  v-model="formData.telefono"
                  type="tel"
                  label="Teléfono"
                  placeholder="11-1234-5678"
                  size="lg"
                />
              </div>

              <!-- Fecha de Alta -->
              <BaseInput
                v-model="formData.fecha_alta"
                type="date"
                label="Fecha de Alta"
                hint="Fecha en que el socio se registró en el gimnasio"
                size="lg"
              />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: Salud (Datos Físicos) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Heart class="w-5 h-5 text-red-500" />
            Salud & Datos Físicos
          </h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <!-- Peso -->
            <BaseInput
              v-model.number="formData.peso"
              type="number"
              step="0.1"
              min="0"
              max="300"
              label="Peso (kg)"
              placeholder="75.5"
              size="lg"
            />
            
            <!-- Altura -->
            <BaseInput
              v-model.number="formData.altura"
              type="number"
              step="0.01"
              min="0"
              max="3"
              label="Altura (m)"
              placeholder="1.75"
              size="lg"
            />
            
            <!-- IMC Calculado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                IMC (Índice de Masa Corporal)
              </label>
              <div class="relative">
                <div 
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold text-lg flex items-center justify-between"
                >
                  <span>{{ imcDisplay }}</span>
                  <span v-if="imc" :class="['inline-flex h-3 w-3 rounded-full', imcColor]"></span>
                </div>
              </div>
              <p v-if="imc" :class="['text-sm mt-1.5 font-medium', imcTextColor]">
                {{ imcCategory }}
              </p>
              <p v-if="imcWarning" class="text-sm mt-1 text-yellow-600 flex items-center gap-1">
                <AlertTriangle class="w-4 h-4" />
                Verifique los datos ingresados
              </p>
            </div>
          </div>

          <!-- Apto Físico -->
          <div class="mt-6 pt-6 border-t border-gray-100">
            <BaseInput
              v-model="formData.apto_fisico"
              type="date"
              label="Fecha de Vencimiento del Apto Físico"
              hint="Fecha hasta la cual es válido el apto médico"
              size="lg"
            />
          </div>
        </div>

        <!-- SECCIÓN 3: Membresía y Estado -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard class="w-5 h-5 text-primary-500" />
            Membresía y Estado
          </h2>
          
          <div class="space-y-6">
            <!-- Toggle: Es Socio del Club -->
            <button
              type="button"
              @click="formData.es_socio_club = !formData.es_socio_club"
              :class="[
                'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all touch-manipulation',
                formData.es_socio_club 
                  ? 'bg-yellow-50 border-yellow-300' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center gap-3">
                <div :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  formData.es_socio_club ? 'bg-yellow-100' : 'bg-gray-200'
                ]">
                  <Star :class="[
                    'w-6 h-6',
                    formData.es_socio_club ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                  ]" />
                </div>
                <div class="text-left">
                  <p class="font-semibold text-gray-900">¿Es Socio del Club?</p>
                  <p class="text-sm text-gray-500">Aplica tarifa preferencial en los planes</p>
                </div>
              </div>
              <div :class="[
                'w-14 h-8 rounded-full p-1 transition-colors',
                formData.es_socio_club ? 'bg-yellow-400' : 'bg-gray-300'
              ]">
                <div :class="[
                  'w-6 h-6 rounded-full bg-white shadow-sm transition-transform',
                  formData.es_socio_club ? 'translate-x-6' : 'translate-x-0'
                ]"></div>
              </div>
            </button>

            <!-- Selección de Plan (Cards) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Plan Asociado
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <!-- Opción: Sin plan fijo -->
                <button
                  type="button"
                  @click="formData.plan_id = null"
                  :class="[
                    'p-4 rounded-xl border-2 text-left transition-all touch-manipulation',
                    formData.plan_id === null
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                  ]"
                >
                  <p class="font-semibold text-gray-900">Sin plan fijo</p>
                  <p class="text-sm text-gray-500">Elegir al pagar</p>
                </button>
                
                <!-- Planes de la DB -->
                <button
                  v-for="plan in plans"
                  :key="plan.id"
                  type="button"
                  @click="formData.plan_id = plan.id"
                  :class="[
                    'p-4 rounded-xl border-2 text-left transition-all touch-manipulation',
                    formData.plan_id === plan.id
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                  ]"
                >
                  <p class="font-semibold text-gray-900">{{ plan.nombre }}</p>
                  <p class="text-sm text-gray-500">{{ plan.dias_duracion }} días</p>
                  <p class="text-lg font-bold text-primary-600 mt-1">
                    ${{ formatPrice(formData.es_socio_club && plan.precio_socio ? plan.precio_socio : plan.precio) }}
                  </p>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                El plan se pre-seleccionará automáticamente al registrar pagos
              </p>
            </div>

            <!-- Toggle: Activo/Inactivo -->
            <button
              type="button"
              @click="formData.activo = !formData.activo"
              :class="[
                'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all touch-manipulation',
                formData.activo 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center gap-3">
                <div :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  formData.activo ? 'bg-green-100' : 'bg-gray-200'
                ]">
                  <UserCheck v-if="formData.activo" class="w-6 h-6 text-green-600" />
                  <UserX v-else class="w-6 h-6 text-gray-400" />
                </div>
                <div class="text-left">
                  <p class="font-semibold text-gray-900">Socio Activo</p>
                  <p class="text-sm text-gray-500">Los socios inactivos no pueden hacer check-in</p>
                </div>
              </div>
              <StatusBadge :status="formData.activo ? 'activo' : 'inactivo'" size="lg" />
            </button>
          </div>
        </div>

        <!-- Panel de errores de duplicados -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div 
            v-if="duplicateErrors.length > 0" 
            class="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-xl shadow-sm overflow-hidden"
          >
            <div class="p-5">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <UserX class="w-6 h-6 text-amber-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-amber-800 mb-1">
                    Socio ya registrado
                  </h3>
                  <p class="text-sm text-amber-700 mb-3">
                    Se encontraron coincidencias con socios existentes en el sistema:
                  </p>
                  <ul class="space-y-2">
                    <li 
                      v-for="(err, index) in duplicateErrors" 
                      :key="index"
                      class="flex items-center gap-2 text-sm text-amber-800 bg-white/60 px-3 py-2 rounded-lg"
                    >
                      <span class="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-700">{{ index + 1 }}</span>
                      {{ err }}
                    </li>
                  </ul>
                </div>
                <button 
                  type="button"
                  @click="duplicateErrors = []"
                  class="flex-shrink-0 p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Error general -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div 
            v-if="error" 
            class="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 rounded-xl shadow-sm overflow-hidden"
          >
            <div class="p-5">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle class="w-6 h-6 text-red-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-red-800 mb-1">
                    Error al guardar
                  </h3>
                  <p class="text-sm text-red-700">
                    {{ error }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            :disabled="loading || uploadingPhoto"
            class="flex-1 sm:flex-none"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
            <span v-else>{{ isEditing ? 'Actualizar Socio' : 'Guardar Socio' }}</span>
          </BaseButton>

          <BaseButton
            type="button"
            variant="outline"
            size="lg"
            @click="goBack"
            :disabled="loading || uploadingPhoto"
          >
            Cancelar
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { useMembers } from '@/composables/useMembers'
import { useParameters } from '@/composables/useParameters'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { 
  User, 
  UserCircle,
  Upload, 
  X, 
  ArrowLeft, 
  Heart, 
  CreditCard,
  Star,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { loading, error, getMemberById, createMember, updateMember, uploadAvatar, deleteAvatar, validateNoDuplicates } = useMembers()
const { plans, fetchParameters } = useParameters()

const isEditing = computed(() => !!route.params.id)

const formData = ref({
  nombre: '',
  apellido: '',
  dni: '',
  fecha_nacimiento: '',
  fecha_alta: new Date().toISOString().split('T')[0],
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
const duplicateErrors = ref([])

// Formatear precio con separador de miles
function formatPrice(price) {
  if (!price) return '0'
  return new Intl.NumberFormat('es-AR').format(price)
}

// Calcular IMC
const imc = computed(() => {
  if (formData.value.peso && formData.value.altura && formData.value.altura > 0) {
    return formData.value.peso / (formData.value.altura * formData.value.altura)
  }
  return null
})

const imcDisplay = computed(() => {
  return imc.value ? imc.value.toFixed(1) : '—'
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

  if (!file.type.startsWith('image/')) {
    toast.error('Solo se permiten archivos de imagen')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.error('La imagen no debe superar 2MB')
    return
  }

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
  if (isEditing.value && formData.value.foto_url) {
    formData.value.foto_url = ''
  }
}

async function handleSubmit() {
  if (!formData.value.nombre.trim() || !formData.value.apellido.trim()) {
    toast.error('Complete los campos obligatorios')
    return
  }

  try {
    // Validar duplicados antes de crear/actualizar
    const excludeId = isEditing.value ? route.params.id : null
    const validation = await validateNoDuplicates(formData.value, excludeId)
    
    if (!validation.valid) {
      // Mostrar errores de duplicado en el panel profesional
      duplicateErrors.value = validation.errors
      // Scroll suave hacia el panel de errores
      setTimeout(() => {
        document.querySelector('.border-amber-400')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      return
    }
    
    // Limpiar errores previos si la validación pasó
    duplicateErrors.value = []

    let memberData = { ...formData.value }
    
    if (photoFile.value) {
      uploadingPhoto.value = true
      
      if (isEditing.value && previousPhotoUrl.value) {
        await deleteAvatar(previousPhotoUrl.value)
      }
      
      const memberId = isEditing.value ? route.params.id : formData.value.dni
      const uploadResult = await uploadAvatar(photoFile.value, memberId)
      
      if (uploadResult.success) {
        memberData.foto_url = uploadResult.url
      } else {
        toast.error('Error al subir la foto: ' + uploadResult.error)
        uploadingPhoto.value = false
        return
      }
      
      uploadingPhoto.value = false
    } else if (!photoPreview.value && previousPhotoUrl.value) {
      await deleteAvatar(previousPhotoUrl.value)
      memberData.foto_url = null
    }

    const result = isEditing.value
      ? await updateMember(route.params.id, memberData)
      : await createMember(memberData)

    if (result.success) {
      toast.success(isEditing.value ? 'Socio actualizado correctamente' : 'Socio creado correctamente')
      router.push({ name: 'Members' })
    } else {
      toast.error('Error al guardar: ' + result.error)
    }
  } catch (err) {
    toast.error('Error inesperado: ' + err.message)
  }
}

function goBack() {
  router.push({ name: 'Members' })
}

onMounted(async () => {
  await fetchParameters()
  
  if (isEditing.value) {
    const result = await getMemberById(route.params.id)
    if (result.success) {
      formData.value = { ...formData.value, ...result.data }
      
      if (formData.value.foto_url) {
        photoPreview.value = formData.value.foto_url
        previousPhotoUrl.value = formData.value.foto_url
      }
    }
  }
})
</script>

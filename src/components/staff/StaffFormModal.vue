<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Success Screen -->
      <div v-if="showSuccess" class="p-6">
        <div class="text-center mb-6">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle class="h-10 w-10 text-green-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            ¡Usuario creado exitosamente!
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Guarda esta contraseña, solo se mostrará una vez:
          </p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Usuario:</span>
            <span class="text-sm font-semibold text-gray-900">{{ form.usuario }}</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Email:</span>
            <span class="text-sm text-gray-900">{{ form.email }}</span>
          </div>
          <div class="border-t border-gray-200 mt-3 pt-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Contraseña:</span>
              <BaseButton @click="copyPassword" color="secondary" size="sm">
                <Copy class="w-4 h-4 mr-1" />
                Copiar
              </BaseButton>
            </div>
            <div class="mt-2 p-3 bg-white border border-gray-200 rounded font-mono text-sm break-all">
              {{ generatedPassword }}
            </div>
          </div>
        </div>

        <BaseButton @click="closeModal" color="primary" class="w-full">
          Entendido
        </BaseButton>
      </div>

      <!-- Form Screen -->
      <div v-else class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Usuario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Usuario *
            </label>
            <BaseInput
              v-model="form.usuario"
              placeholder="usuario123"
              :disabled="loading"
              required
              @blur="validateUsuario"
            />
            <p v-if="errors.usuario" class="text-xs text-red-600 mt-1">{{ errors.usuario }}</p>
          </div>

          <!-- Email (solo en crear) -->
          <div v-if="!isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <BaseInput
              v-model="form.email"
              type="email"
              placeholder="usuario@ejemplo.com"
              :disabled="loading"
              required
            />
          </div>

          <!-- Contraseña (solo en crear) -->
          <div v-if="!isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <div class="relative">
              <BaseInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                :disabled="loading"
                required
                minlength="6"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </div>
            <BaseButton
              type="button"
              @click="generateRandomPassword"
              color="secondary"
              size="sm"
              class="mt-2"
            >
              <RefreshCw class="w-4 h-4 mr-1" />
              Generar Contraseña
            </BaseButton>
          </div>

          <!-- Rol -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              v-model="form.rol"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="loading"
              required
            >
              <option value="">Seleccionar...</option>
              <option value="admin">Admin</option>
              <option value="recepcion">Recepción</option>
            </select>
          </div>

          <!-- Email info (en editar) -->
          <div v-if="isEditing" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="flex items-start">
              <AlertCircle class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">Email: {{ staff?.email }}</p>
                <p class="text-xs">El email no se puede modificar una vez creado</p>
              </div>
            </div>
          </div>

          <!-- Error general -->
          <div v-if="errors.general" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-800">{{ errors.general }}</p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <BaseButton
              type="button"
              @click="closeModal"
              color="secondary"
              class="flex-1"
              :disabled="loading"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              type="submit"
              color="primary"
              class="flex-1"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </span>
              <span v-else>{{ isEditing ? 'Actualizar' : 'Crear Usuario' }}</span>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Eye, EyeOff, RefreshCw, CheckCircle, Copy, AlertCircle } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useStaff } from '@/composables/useStaff'

const props = defineProps({
  staff: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const { createStaff, updateStaff } = useStaff()

const isEditing = computed(() => !!props.staff)

const form = ref({
  usuario: '',
  email: '',
  password: '',
  rol: ''
})

const errors = ref({
  usuario: '',
  general: ''
})

const loading = ref(false)
const showPassword = ref(false)
const showSuccess = ref(false)
const generatedPassword = ref('')

// Inicializar form si está editando
watch(() => props.staff, (newStaff) => {
  if (newStaff) {
    form.value.usuario = newStaff.usuario
    form.value.email = newStaff.email
    form.value.rol = newStaff.rol
  }
}, { immediate: true })

const validateUsuario = () => {
  errors.value.usuario = ''
  if (form.value.usuario.includes(' ')) {
    errors.value.usuario = 'El nombre de usuario no puede contener espacios'
    return false
  }
  return true
}

const generateRandomPassword = () => {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  form.value.password = password
  showPassword.value = true
}

const handleSubmit = async () => {
  errors.value.general = ''
  
  if (!validateUsuario()) return

  loading.value = true

  try {
    let result

    if (isEditing.value) {
      // Editar
      result = await updateStaff(props.staff.id, {
        usuario: form.value.usuario,
        rol: form.value.rol
      })
    } else {
      // Crear
      generatedPassword.value = form.value.password
      result = await createStaff({
        usuario: form.value.usuario,
        email: form.value.email,
        password: form.value.password,
        rol: form.value.rol
      })
    }

    if (result.success) {
      if (isEditing.value) {
        emit('success')
        emit('close')
      } else {
        // Mostrar pantalla de éxito con la contraseña
        showSuccess.value = true
      }
    } else {
      errors.value.general = result.error || 'Error al guardar el usuario'
    }
  } catch (err) {
    errors.value.general = err.message || 'Error inesperado'
  } finally {
    loading.value = false
  }
}

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
    alert('Contraseña copiada al portapapeles')
  } catch (err) {
    console.error('Error copiando:', err)
  }
}

const closeModal = () => {
  emit('close')
}
</script>

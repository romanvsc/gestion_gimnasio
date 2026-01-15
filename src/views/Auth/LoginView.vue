<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full">
      <!-- Card principal -->
      <div class="bg-white rounded-2xl shadow-xl p-10">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <!-- Logo institucional o icono por defecto -->
          <div class="mx-auto mb-4 flex items-center justify-center">
            <img 
              v-if="settings.logo_url" 
              :src="settings.logo_url" 
              :alt="settings.nombre_gimnasio"
              class="h-20 max-w-xs object-contain"
            >
            <div v-else class="h-20 w-20 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Dumbbell class="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ settings.nombre_gimnasio }}
          </h1>
          <p class="text-gray-500">
            Inicia sesión para continuar
          </p>
        </div>

        <!-- Formulario de login -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              autocomplete="email"
              required
              @focus="clearErrors"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              :class="{ 'border-red-300 focus:ring-red-500': emailError }"
            />
            <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
          </div>

          <!-- Contraseña -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
              @focus="clearErrors"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              :class="{ 'border-red-300 focus:ring-red-500': passwordError }"
            />
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <!-- Error general -->
          <div 
            v-if="generalError" 
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {{ generalError }}
          </div>

          <!-- Botón de submit -->
          <button
            type="submit"
            :disabled="!isFormValid || userStore.loading"
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!userStore.loading">Iniciar Sesión</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando...
            </span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-6 text-center text-sm text-gray-500">
          <p>
            ¿Olvidaste tu contraseña?
            <a href="#" class="text-emerald-600 hover:text-emerald-700 font-medium">
              Recuperar
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useSettings } from '@/composables/useSettings'
import { Dumbbell } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const { settings } = useSettings()

// Estado del formulario
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const generalError = ref('')

// Validación del formulario
const isFormValid = computed(() => {
  return email.value.trim() !== '' && password.value.trim() !== ''
})

// Limpiar errores
function clearErrors() {
  emailError.value = ''
  passwordError.value = ''
  generalError.value = ''
  userStore.clearError()
}

// Validar campos
function validateForm() {
  let isValid = true

  if (!email.value.trim()) {
    emailError.value = 'El email es requerido'
    isValid = false
  } else if (!isValidEmail(email.value)) {
    emailError.value = 'Email inválido'
    isValid = false
  }

  if (!password.value.trim()) {
    passwordError.value = 'La contraseña es requerida'
    isValid = false
  } else if (password.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  return isValid
}

// Validar formato de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Manejar login
async function handleLogin() {
  clearErrors()

  if (!validateForm()) {
    return
  }

  const result = await userStore.login(email.value.trim(), password.value)

  if (result.success) {
    // Redirigir al dashboard
    router.push({ name: 'Dashboard' })
  } else {
    // Mostrar error
    generalError.value = 'Credenciales incorrectas. Por favor, intenta de nuevo.'
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full">
      <!-- Card principal -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <div class="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <svg 
              class="h-10 w-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Gestión Gimnasio
          </h1>
          <p class="text-gray-600">
            Inicia sesión para continuar
          </p>
        </div>

        <!-- Formulario de login -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <BaseInput
            v-model="email"
            type="email"
            label="Email"
            placeholder="tu@email.com"
            autocomplete="email"
            required
            :error="emailError"
            @focus="clearErrors"
          />

          <!-- Contraseña -->
          <BaseInput
            v-model="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            autocomplete="current-password"
            required
            :error="passwordError"
            @focus="clearErrors"
          />

          <!-- Error general -->
          <div 
            v-if="generalError" 
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {{ generalError }}
          </div>

          <!-- Botón de submit -->
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            full-width
            :loading="userStore.loading"
            :disabled="!isFormValid"
          >
            Iniciar Sesión
          </BaseButton>
        </form>

        <!-- Footer -->
        <div class="mt-6 text-center text-sm text-gray-600">
          <p>
            ¿Olvidaste tu contraseña?
            <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">
              Recuperar
            </a>
          </p>
        </div>
      </div>

      <!-- Info adicional -->
      <div class="mt-4 text-center text-sm text-gray-600">
        <p>Sistema de Gestión para Gimnasios</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()

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

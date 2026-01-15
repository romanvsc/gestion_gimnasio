<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Panel izquierdo - Hero con imagen de fondo (oculto en móviles) -->
    <div 
      class="hidden lg:flex lg:w-1/2 relative overflow-hidden"
    >
      <!-- Fondo con overlay azul -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900/95 via-primary-800/90 to-primary-700/85"></div>
      
      <!-- Imagen de fondo con patrón -->
      <div class="absolute inset-0 opacity-30" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
      
      <!-- Contenido del hero - Typewriter effect -->
      <div class="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
        <div class="max-w-lg">
          <h2 class="text-4xl xl:text-5xl font-bold leading-tight">
            <span class="typewriter">{{ displayedText }}</span>
            <span v-if="isTyping" class="cursor-blink">|</span>
          </h2>
        </div>
        
        <!-- Decoración inferior -->
        <div class="absolute bottom-12 left-12 xl:left-20 flex items-center space-x-4">
          <div class="flex -space-x-2">
            <div class="w-10 h-10 rounded-full bg-primary-400 border-2 border-primary-800 flex items-center justify-center">
              <Dumbbell class="w-5 h-5 text-white" />
            </div>
            <div class="w-10 h-10 rounded-full bg-primary-500 border-2 border-primary-800 flex items-center justify-center">
              <Users class="w-5 h-5 text-white" />
            </div>
            <div class="w-10 h-10 rounded-full bg-primary-600 border-2 border-primary-800 flex items-center justify-center">
              <TrendingUp class="w-5 h-5 text-white" />
            </div>
          </div>
          <span class="text-sm text-primary-200">Sistema de gestión completo</span>
        </div>
      </div>
    </div>

    <!-- Panel derecho - Formulario de login -->
    <div class="flex-1 flex items-center justify-center px-6 py-8 lg:px-12 bg-white">
      <div class="w-full max-w-md">
        <!-- Título de bienvenida -->
        <div class="text-center lg:text-left mb-8">
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Iniciar Sesión
          </h1>
          <p class="text-gray-500">
            Por favor, ingresa tus datos para acceder.
          </p>
        </div>

        <!-- Formulario de login -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Campo de Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Correo Electrónico *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                autocomplete="email"
                required
                @focus="clearErrors"
                class="w-full pl-10 pr-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200"
                :class="{ 'border-red-300 focus:ring-red-500 bg-red-50': emailError }"
              />
            </div>
            <p v-if="emailError" class="mt-1.5 text-sm text-red-600">{{ emailError }}</p>
          </div>

          <!-- Campo de Contraseña -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••"
                autocomplete="current-password"
                required
                @focus="clearErrors"
                class="w-full pl-10 pr-12 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200"
                :class="{ 'border-red-300 focus:ring-red-500 bg-red-50': passwordError }"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <EyeOff v-if="showPassword" class="h-5 w-5" />
                <Eye v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="passwordError" class="mt-1.5 text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <!-- Error general -->
          <div 
            v-if="generalError" 
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center"
          >
            <AlertCircle class="h-5 w-5 mr-2 flex-shrink-0" />
            {{ generalError }}
          </div>

          <!-- Botón de submit -->
          <button
            type="submit"
            :disabled="!isFormValid || userStore.loading"
            class="w-full bg-primary-900 hover:bg-primary-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            <span v-if="!userStore.loading" class="flex items-center">
              Iniciar Sesión
              <ArrowRight class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span v-else class="flex items-center">
              <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando...
            </span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500">
            ¿Problemas para ingresar?
            <a href="#" class="text-primary-600 hover:text-primary-700 font-medium hover:underline ml-1">
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- Header móvil con gradiente (visible solo en móviles) -->
    <div class="lg:hidden fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-900 via-primary-600 to-primary-400"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useSettings } from '@/composables/useSettings'
import { 
  Dumbbell, 
  Users, 
  TrendingUp, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle 
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const { settings } = useSettings()

// Estado del formulario
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const generalError = ref('')
const showPassword = ref(false)

// Estado del efecto typewriter
const displayedText = ref('')
const isTyping = ref(true)
const fullText = computed(() => `Bienvenido a ${settings.nombre_gimnasio || 'nuestro gimnasio'}`)

// Validación del formulario
const isFormValid = computed(() => {
  return email.value.trim() !== '' && password.value.trim() !== ''
})

// Efecto typewriter
onMounted(() => {
  startTypewriter()
})

// Reiniciar typewriter si cambia el nombre del gimnasio
watch(() => settings.nombre_gimnasio, () => {
  displayedText.value = ''
  isTyping.value = true
  startTypewriter()
})

function startTypewriter() {
  let currentIndex = 0
  const text = fullText.value
  const typingSpeed = 800 / text.length
  
  const typeInterval = setInterval(() => {
    if (currentIndex < text.length) {
      displayedText.value += text[currentIndex]
      currentIndex++
    } else {
      clearInterval(typeInterval)
      setTimeout(() => {
        isTyping.value = false
      }, 500)
    }
  }, typingSpeed)
}

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
    router.push({ name: 'Dashboard' })
  } else {
    generalError.value = 'Credenciales incorrectas. Por favor, intenta de nuevo.'
  }
}
</script>

<style scoped>
/* Animación del cursor parpadeante */
.cursor-blink {
  animation: blink 1s step-end infinite;
  color: #0284c7; /* primary-600 */
  font-weight: 300;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* Asegurar que el texto no se desborde */
.typewriter {
  display: inline-block;
  word-break: break-word;
}
</style>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row animate-fade-in">
    <!-- Panel izquierdo - Hero con imagen de fondo (oculto en móviles) -->
    <div 
      class="hidden lg:flex lg:w-1/2 relative overflow-hidden"
    >
      <!-- Fondo con overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900/95 via-primary-800/90 to-primary-700/85"></div>
      
      <!-- Logo como fondo completo (estilo imagen de portada) -->
      <div 
        v-if="settingsReady && settings.logo_url" 
        class="absolute inset-0 pointer-events-none"
      >
        <img 
          :src="settings.logo_url" 
          :alt="settings.nombre_gimnasio"
          class="w-full h-full object-cover opacity-[0.2] mix-blend-overlay grayscale"
        />
      </div>
      
      <!-- Patrón decorativo (mientras carga o si no hay logo) -->
      <div 
        v-else-if="!settingsReady || !settings.logo_url"
        class="absolute inset-0 opacity-30" 
        style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
      ></div>
      
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
      <div class="w-full max-w-md animate-slide-up">
        <!-- Logo para móvil -->
        <div class="lg:hidden flex justify-center mb-6">
          <img 
            v-if="settingsReady && settings.logo_url" 
            :src="settings.logo_url" 
            :alt="settings.nombre_gimnasio"
            class="h-16 w-auto object-contain"
          />
          <div v-else class="h-16 w-16 rounded-2xl bg-primary-600 flex items-center justify-center">
            <Dumbbell class="w-8 h-8 text-white" />
          </div>
        </div>

        <!-- Título de bienvenida -->
        <div class="text-center lg:text-left mb-8">
          <h1 class="text-3xl lg:text-4xl font-bold text-page-title mb-2">
            Iniciar Sesión
          </h1>
          <p class="text-page-subtitle">
            Por favor, ingresa tus datos para acceder.
          </p>
        </div>

        <!-- Formulario de login -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Campo de Email -->
          <div>
            <label for="email-input" class="block text-sm font-medium text-gray-700 mb-1.5">
              Correo Electrónico *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email-input"
                ref="emailInput"
                v-model="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                autocomplete="email"
                required
                @input="validateEmailRealTime"
                @focus="clearFieldError('email')"
                class="w-full pl-10 pr-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                :class="{ 
                  'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50': emailError,
                  'border-green-400': email && !emailError && isValidEmail(email)
                }"
              />
              <!-- Indicador de validación -->
              <div v-if="email && !emailError && isValidEmail(email)" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <CheckCircle2 class="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p v-if="emailError" class="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle class="h-3.5 w-3.5" />
              {{ emailError }}
            </p>
          </div>

          <!-- Campo de Contraseña -->
          <div>
            <label for="password-input" class="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password-input"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••"
                autocomplete="current-password"
                required
                @input="validatePasswordRealTime"
                @focus="clearFieldError('password')"
                @keydown="checkCapsLock"
                @keyup="checkCapsLock"
                class="w-full pl-10 pr-12 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                :class="{ 
                  'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50': passwordError,
                  'border-green-400': password && !passwordError && password.length >= 6
                }"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <EyeOff v-if="showPassword" class="h-5 w-5" />
                <Eye v-else class="h-5 w-5" />
              </button>
            </div>
            <!-- Indicador de Caps Lock -->
            <p v-if="capsLockOn" class="mt-1.5 text-sm text-amber-600 flex items-center gap-1">
              <AlertTriangle class="h-3.5 w-3.5" />
              Bloq Mayús está activado
            </p>
            <p v-else-if="passwordError" class="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle class="h-3.5 w-3.5" />
              {{ passwordError }}
            </p>
          </div>

          <!-- Recordarme -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                v-model="rememberMe"
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 transition-colors"
              />
              <span class="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                Recordar mi correo
              </span>
            </label>
          </div>

          <!-- Error general -->
          <Transition name="shake">
            <div 
              v-if="generalError" 
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center"
            >
              <AlertCircle class="h-5 w-5 mr-2 flex-shrink-0" />
              {{ generalError }}
            </div>
          </Transition>

          <!-- Botón de submit -->
          <button
            type="submit"
            :disabled="!isFormValid || userStore.loading"
            class="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center group shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 disabled:shadow-none"
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
  AlertCircle,
  AlertTriangle,
  CheckCircle2
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const { settings, fetchSettings, loading: settingsLoading } = useSettings()

// Estado para saber si los settings ya cargaron
const settingsReady = ref(false)

// Refs para elementos del DOM
const emailInput = ref(null)

// Estado del formulario
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const generalError = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const capsLockOn = ref(false)

// Estado del efecto typewriter
const displayedText = ref('')
const isTyping = ref(true)
const fullText = ref('Bienvenido a nuestro gimnasio')
let typewriterInterval = null

// Validación del formulario
const isFormValid = computed(() => {
  return email.value.trim() !== '' && 
         password.value.trim() !== '' && 
         isValidEmail(email.value) &&
         password.value.length >= 6
})

// Cargar email guardado y autofocus
onMounted(async () => {
  // Cargar configuración del gimnasio primero
  const result = await fetchSettings()
  console.log('fetchSettings result:', result)
  console.log('settings después de fetch:', settings.nombre_gimnasio, settings.logo_url)
  settingsReady.value = true
  
  // Actualizar el texto del typewriter con el nombre real
  fullText.value = `Bienvenido a ${settings.nombre_gimnasio || 'nuestro gimnasio'}`
  console.log('fullText set to:', fullText.value)
  
  // Cargar email guardado
  const savedEmail = localStorage.getItem('rememberedEmail')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }
  
  // Autofocus en el campo email
  await nextTick()
  if (emailInput.value) {
    emailInput.value.focus()
  }
  
  // Iniciar typewriter (ahora con settings cargados)
  startTypewriter()
})

// Reiniciar typewriter si cambia el nombre del gimnasio
watch(() => settings.nombre_gimnasio, (newName) => {
  if (newName && settingsReady.value) {
    // Limpiar intervalo anterior
    if (typewriterInterval) clearInterval(typewriterInterval)
    displayedText.value = ''
    isTyping.value = true
    fullText.value = `Bienvenido a ${newName}`
    startTypewriter()
  }
})

function startTypewriter() {
  let currentIndex = 0
  const text = fullText.value
  const typingSpeed = 800 / text.length
  
  typewriterInterval = setInterval(() => {
    if (currentIndex < text.length) {
      displayedText.value += text[currentIndex]
      currentIndex++
    } else {
      clearInterval(typewriterInterval)
      typewriterInterval = null
      setTimeout(() => {
        isTyping.value = false
      }, 500)
    }
  }, typingSpeed)
}

// Detectar Caps Lock
function checkCapsLock(event) {
  capsLockOn.value = event.getModifierState && event.getModifierState('CapsLock')
}

// Validación en tiempo real - Email
function validateEmailRealTime() {
  if (email.value && !isValidEmail(email.value)) {
    emailError.value = 'Formato de email inválido'
  } else {
    emailError.value = ''
  }
}

// Validación en tiempo real - Password
function validatePasswordRealTime() {
  if (password.value && password.value.length < 6) {
    passwordError.value = 'Mínimo 6 caracteres'
  } else {
    passwordError.value = ''
  }
}

// Limpiar error de un campo específico
function clearFieldError(field) {
  if (field === 'email') emailError.value = ''
  if (field === 'password') passwordError.value = ''
  generalError.value = ''
  userStore.clearError()
}

// Limpiar todos los errores
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

  // Guardar o eliminar email según preferencia
  if (rememberMe.value) {
    localStorage.setItem('rememberedEmail', email.value.trim())
  } else {
    localStorage.removeItem('rememberedEmail')
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
/* Animación de entrada - Fade In */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Animación de entrada - Slide Up */
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animación del cursor parpadeante */
.cursor-blink {
  animation: blink 1s step-end infinite;
  color: #5F388C; /* primary-600 */
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

/* Animación de shake para errores */
.shake-enter-active {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Ocultar el botón nativo de mostrar/ocultar contraseña del navegador */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

/* Para navegadores basados en WebKit (Chrome, Edge, Safari) */
input::-webkit-credentials-auto-fill-button,
input::-webkit-textfield-decoration-container {
  visibility: hidden;
  pointer-events: none;
}
</style>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Backdrop con blur -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        <!-- Modal Card -->
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transform">
          <!-- Fondo decorativo superior con degradado -->
          <div 
            class="absolute top-0 left-0 right-0 h-36"
            :class="bgGradientClass"
          />
          
          <!-- Partículas decorativas -->
          <div class="absolute top-4 left-6 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
          <div class="absolute top-8 right-8 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-100" />
          <div class="absolute top-16 left-12 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-200" />
          
          <!-- Contenido -->
          <div class="relative p-6 pt-10">
            <!-- Ícono circular grande con sombra -->
            <div class="flex justify-center mb-5">
              <div 
                class="w-24 h-24 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white"
                :class="iconBgClass"
              >
                <component 
                  :is="iconComponent" 
                  class="w-12 h-12"
                  :class="iconColorClass"
                />
              </div>
            </div>
            
            <!-- Título -->
            <h3 class="text-2xl font-bold text-center text-gray-900 mb-2">
              {{ title }}
            </h3>
            
            <!-- Mensaje -->
            <p class="text-center text-gray-500 mb-6 text-base leading-relaxed px-2">
              {{ message }}
            </p>
            
            <!-- Detalles (slot para contenido adicional) -->
            <div v-if="$slots.default" class="bg-gray-50 rounded-2xl p-4 mb-6">
              <slot />
            </div>
            
            <!-- Botón con degradado -->
            <button
              @click="close"
              class="w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              :class="buttonClass"
            >
              {{ buttonText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    default: 'success', // success, warning, error, info
    validator: (val) => ['success', 'warning', 'error', 'info'].includes(val)
  },
  title: {
    type: String,
    default: '¡Operación exitosa!'
  },
  message: {
    type: String,
    default: 'Los cambios se han guardado correctamente.'
  },
  buttonText: {
    type: String,
    default: 'Entendido'
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

// Mapeo de configuración según el tipo
const typeConfig = computed(() => ({
  success: {
    bgGradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
    iconBg: 'bg-white',
    iconColor: 'text-emerald-500',
    button: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
  },
  warning: {
    bgGradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600',
    iconBg: 'bg-white',
    iconColor: 'text-amber-500',
    button: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
  },
  error: {
    bgGradient: 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-600',
    iconBg: 'bg-white',
    iconColor: 'text-red-500',
    button: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
  },
  info: {
    bgGradient: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600',
    iconBg: 'bg-white',
    iconColor: 'text-blue-500',
    button: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
  }
}))

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info
}

const bgGradientClass = computed(() => typeConfig.value[props.type].bgGradient)
const iconBgClass = computed(() => typeConfig.value[props.type].iconBg)
const iconColorClass = computed(() => typeConfig.value[props.type].iconColor)
const buttonClass = computed(() => typeConfig.value[props.type].button)
const iconComponent = computed(() => iconMap[props.type])

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child {
  transform: scale(0.85) translateY(30px);
  opacity: 0;
}

.modal-leave-to > div:last-child {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}
</style>

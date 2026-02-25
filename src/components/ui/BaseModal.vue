<template>
  <Teleport to="body">
    <Transition name="modal-backdrop" appear>
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc="handleClose"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          @click="closeOnBackdrop && handleClose()"
        />
        
        <!-- Modal Panel -->
        <Transition name="modal-panel" appear>
          <div 
            v-if="modelValue"
            class="relative w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            :class="sizeClasses"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
          >
            <!-- Header -->
            <div 
              v-if="title || $slots.header || showClose"
              class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700"
              :class="headerClass"
            >
              <div v-if="$slots.header" class="flex-1">
                <slot name="header" />
              </div>
              <h3 v-else-if="title" class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <slot name="icon" />
                {{ title }}
              </h3>
              <button 
                v-if="showClose"
                @click="handleClose"
                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                aria-label="Cerrar"
              >
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div 
              class="px-6 py-4 overflow-y-auto"
              :class="bodyClass"
              :style="{ maxHeight: maxBodyHeight }"
            >
              <slot />
            </div>

            <!-- Footer -->
            <div 
              v-if="$slots.footer"
              class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'xl', 'full'].includes(v)
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  closeOnEsc: {
    type: Boolean,
    default: true
  },
  headerClass: {
    type: String,
    default: ''
  },
  bodyClass: {
    type: String,
    default: ''
  },
  maxBodyHeight: {
    type: String,
    default: '70vh'
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const sizeClasses = computed(() => ({
  'max-w-sm': props.size === 'sm',
  'max-w-lg': props.size === 'md',
  'max-w-2xl': props.size === 'lg',
  'max-w-4xl': props.size === 'xl',
  'max-w-[95vw] max-h-[95vh]': props.size === 'full'
}))

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

// Bloquear scroll del body cuando el modal está abierto
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Handler de Esc global
function handleEscKey(e) {
  if (e.key === 'Escape' && props.modelValue && props.closeOnEsc) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-panel-enter-active {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.modal-panel-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-panel-enter-from {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
.modal-panel-leave-to {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>

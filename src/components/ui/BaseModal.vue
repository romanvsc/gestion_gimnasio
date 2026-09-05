<template>
  <Teleport to="body">
    <Transition name="modal-backdrop" appear>
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
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
            ref="panelRef"
            class="relative max-h-[calc(100dvh-var(--mobile-nav-height)-0.5rem)] w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-page-card dark:ring-1 dark:ring-white/10 sm:max-h-[95vh] sm:rounded-2xl"
            :class="sizeClasses"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? titleId : undefined"
            :aria-label="title ? undefined : 'Diálogo'"
            tabindex="-1"
          >
            <!-- Header -->
            <div 
              v-if="title || $slots.header || showClose"
              class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50"
              :class="headerClass"
            >
              <div v-if="$slots.header" class="flex-1">
                <slot name="header" />
              </div>
              <h3 v-else-if="title" :id="titleId" class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <slot name="icon" />
                {{ title }}
              </h3>
              <button 
                v-if="showClose"
                @click="handleClose"
                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors touch-manipulation"
                aria-label="Cerrar"
              >
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div 
              class="overflow-y-auto px-4 py-4 sm:px-6"
              :class="bodyClass"
              :style="{ maxHeight: maxBodyHeight }"
            >
              <slot />
            </div>

            <!-- Footer -->
            <div 
              v-if="$slots.footer"
              class="px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-white/5"
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
import { computed, nextTick, ref, watch, onMounted, onUnmounted } from 'vue'

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
const panelRef = ref(null)
const titleId = `modal-title-${Math.random().toString(36).slice(2, 10)}`
let previouslyFocusedElement = null
let previousBodyOverflow = ''

const sizeClasses = computed(() => ({
  'max-w-sm': props.size === 'sm',
  'max-w-lg': props.size === 'md',
  'max-w-2xl': props.size === 'lg',
  'max-w-4xl': props.size === 'xl',
  'max-w-[95vw]': props.size === 'full'
}))

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function getFocusableElements() {
  if (!panelRef.value) return []

  return [...panelRef.value.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter(element => element.offsetParent !== null)
}

function focusFirstElement() {
  nextTick(() => {
    const [firstFocusable] = getFocusableElements()
    ;(firstFocusable || panelRef.value)?.focus()
  })
}

function restoreFocus() {
  if (previouslyFocusedElement?.isConnected) {
    previouslyFocusedElement.focus()
  }
  previouslyFocusedElement = null
}

function handleTabKey(e) {
  if (!props.modelValue || e.key !== 'Tab') return

  const focusableElements = getFocusableElements()
  if (focusableElements.length === 0) {
    e.preventDefault()
    panelRef.value?.focus()
    return
  }

  const first = focusableElements[0]
  const last = focusableElements[focusableElements.length - 1]

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

// Bloquear scroll del body cuando el modal está abierto
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    previouslyFocusedElement = document.activeElement
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    focusFirstElement()
  } else {
    document.body.style.overflow = previousBodyOverflow
    restoreFocus()
  }
})

// Handler de Esc global
function handleEscKey(e) {
  if (e.key === 'Escape' && props.modelValue && props.closeOnEsc) {
    handleClose()
  }

  handleTabKey(e)
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
  if (props.modelValue) {
    previouslyFocusedElement = document.activeElement
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    focusFirstElement()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  document.body.style.overflow = previousBodyOverflow
  restoreFocus()
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

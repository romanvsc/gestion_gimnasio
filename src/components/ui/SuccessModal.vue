<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <div 
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all"
          @click.stop
        >
          <!-- Icono de éxito -->
          <div class="pt-8 pb-4 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle class="w-10 h-10 text-green-600" />
            </div>
            
            <h3 class="text-2xl font-bold text-gray-900 mb-2">
              {{ title }}
            </h3>
            
            <p class="text-gray-600 px-6">
              {{ message }}
            </p>
          </div>

          <!-- Contenido adicional (slot) -->
          <div v-if="$slots.default" class="px-8 pb-4">
            <slot></slot>
          </div>

          <!-- Botones -->
          <div class="px-8 pb-8">
            <BaseButton
              variant="primary"
              size="lg"
              full-width
              @click="close"
            >
              {{ buttonText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { CheckCircle } from 'lucide-vue-next'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '¡Éxito!'
  },
  message: {
    type: String,
    default: 'La operación se completó correctamente.'
  },
  buttonText: {
    type: String,
    default: 'Aceptar'
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

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

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>

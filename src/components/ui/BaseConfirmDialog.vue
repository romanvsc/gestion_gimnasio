<template>
  <BaseModal
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="title"
    size="sm"
    :close-on-backdrop="false"
    :show-close="false"
  >
    <template #icon>
      <!-- Warning icon -->
      <div 
        class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        :class="iconContainerClasses"
      >
        <svg 
          v-if="type === 'danger'" 
          class="w-5 h-5" 
          aria-hidden="true"
          :class="iconClasses"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <svg 
          v-else-if="type === 'warning'" 
          class="w-5 h-5" 
          aria-hidden="true"
          :class="iconClasses"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <svg 
          v-else 
          class="w-5 h-5" 
          aria-hidden="true"
          :class="iconClasses"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      </div>
    </template>

    <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
      {{ message }}
    </p>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton 
          variant="secondary" 
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton 
          :variant="type === 'danger' ? 'danger' : 'primary'" 
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import { UI_TOKENS } from '@/config/uiTokens'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '¿Estás seguro?'
  },
  message: {
    type: String,
    default: 'Esta acción no se puede deshacer.'
  },
  type: {
    type: String,
    default: 'warning',
    validator: (v) => ['info', 'warning', 'danger'].includes(v)
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const iconContainerClasses = computed(() => ({
  [UI_TOKENS.iconTones[props.type]]: true
}))

const iconClasses = computed(() => ({
  [UI_TOKENS.iconTextTones[props.type]]: true
}))

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

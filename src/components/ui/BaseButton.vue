<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="mr-2">
      <svg 
        class="animate-spin h-4 w-4 inline" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          class="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          stroke-width="4"
        />
        <path 
          class="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </span>
    
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'danger', 'ghost', 'card'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
  
  // Tamaño
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  // Variante
  const variantClasses = {
    primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300 dark:bg-primary-500 dark:hover:bg-primary-600 dark:disabled:bg-primary-800',
    secondary: 'bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-white/10 dark:disabled:bg-gray-800',
    outline: 'bg-transparent text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-50 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-white/10 dark:disabled:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300 dark:bg-red-500 dark:hover:bg-red-600',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400 dark:text-gray-300 dark:hover:bg-white/10 dark:disabled:text-gray-600',
    card: 'bg-page-card text-gray-900 border border-gray-100 shadow-sm hover:shadow-md hover:bg-page-card-hover focus:ring-primary-500 disabled:bg-gray-50 dark:text-gray-100 dark:border-gray-700/50'
  }
  
  // Disabled
  const disabledClasses = (props.disabled || props.loading) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
  
  // Full width
  const widthClasses = props.fullWidth ? 'w-full' : ''
  
  return `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]} ${disabledClasses} ${widthClasses}`
})

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <div class="w-full">
    <label 
      v-if="label" 
      :for="inputId" 
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :autofocus="autofocus"
      :class="inputClasses"
      @input="handleInput"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    
    <p 
      v-if="error" 
      class="mt-1 text-sm text-red-600"
    >
      {{ error }}
    </p>
    
    <p 
      v-if="hint && !error" 
      class="mt-1 text-sm text-gray-500"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  autofocus: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'kiosk'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2.5 text-base rounded-lg',
    lg: 'px-4 py-3 text-lg rounded-lg',
    kiosk: 'px-6 py-6 text-2xl rounded-2xl shadow-lg'
  }
  
  const baseClasses = `block w-full border placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${sizeClasses[props.size]}`
  
  // Kiosk mode tiene estilos especiales de focus
  const focusClasses = props.size === 'kiosk' 
    ? 'focus:ring-4 focus:ring-primary-100' 
    : ''
  
  if (props.error) {
    return `${baseClasses} ${focusClasses} border-red-300 focus:border-red-500 focus:ring-red-200`
  }
  
  if (props.disabled) {
    return `${baseClasses} ${focusClasses} border-gray-200 bg-gray-50 cursor-not-allowed`
  }
  
  return `${baseClasses} ${focusClasses} border-gray-300 focus:border-primary-500 focus:ring-primary-200`
})

function handleInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

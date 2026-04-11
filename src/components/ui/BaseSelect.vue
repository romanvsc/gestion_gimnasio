<template>
  <div class="w-full">
    <label 
      v-if="label" 
      :for="selectId" 
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        :class="selectClasses"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled :selected="!modelValue">
          {{ placeholder }}
        </option>
        <option 
          v-for="option in normalizedOptions" 
          :key="option.value" 
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Chevron icon -->
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>
    
    <p v-if="hint && !error" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: ''
  },
  options: {
    type: Array,
    required: true
    // Acepta: ['a', 'b'] o [{ value: 'a', label: 'A' }] o [{ id: 1, nombre: 'Plan' }]
  },
  /** Nombre del campo que se usará como value en objetos */
  valueKey: {
    type: String,
    default: 'value'
  },
  /** Nombre del campo que se usará como label en objetos */
  labelKey: {
    type: String,
    default: 'label'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Seleccionar...'
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
  id: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectId = computed(() => props.id || `select-${Math.random().toString(36).substr(2, 9)}`)

/**
 * Normaliza las opciones a formato { value, label, disabled }
 * Soporta: strings, { value, label }, { id, nombre }, etc.
 */
const normalizedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt), disabled: false }
    }
    
    return {
      value: opt[props.valueKey] ?? opt.id ?? opt.value ?? '',
      label: opt[props.labelKey] ?? opt.nombre ?? opt.label ?? opt.name ?? '',
      disabled: !!opt.disabled
    }
  })
})

const selectClasses = computed(() => {
  const sizeMap = {
    sm: 'px-3 py-1.5 text-sm rounded-md pr-8',
    md: 'px-4 py-2.5 text-base rounded-lg pr-10',
    lg: 'px-4 py-3 text-lg rounded-lg pr-10'
  }

  const base = `block w-full border appearance-none bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors cursor-pointer ${sizeMap[props.size]}`

  if (props.error) {
    return `${base} border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800 text-gray-900 dark:text-gray-100`
  }

  if (props.disabled) {
    return `${base} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-not-allowed text-gray-400 dark:text-gray-500`
  }

  return `${base} border-gray-300 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-200 dark:focus:ring-primary-800 text-gray-900 dark:text-gray-100`
})

function handleChange(event) {
  const value = event.target.value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

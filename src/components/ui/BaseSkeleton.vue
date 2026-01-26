<template>
  <div
    class="animate-pulse bg-gray-200"
    :class="[roundedClass, customClass]"
    :style="{ width: computedWidth, height: computedHeight }"
  >
    <span class="sr-only">Cargando...</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '1rem' // h-4 equivalent
  },
  rounded: {
    type: String,
    default: 'md', // none, sm, md, lg, xl, 2xl, 3xl, full
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].includes(value)
  },
  class: {
    type: String,
    default: ''
  }
})

const computedWidth = computed(() => {
  if (typeof props.width === 'number') return `${props.width}px`
  return props.width
})

const computedHeight = computed(() => {
  if (typeof props.height === 'number') return `${props.height}px`
  return props.height
})

const roundedClass = computed(() => {
  const map = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    'full': 'rounded-full'
  }
  return map[props.rounded] || 'rounded-md'
})

const customClass = computed(() => props.class)
</script>

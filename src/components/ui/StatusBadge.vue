<template>
  <span :class="badgeClasses">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['activo', 'vencido', 'vigente', 'vencido_apto'].includes(value)
  },
  label: {
    type: String,
    default: ''
  }
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  const statusClasses = {
    'activo': 'bg-green-100 text-green-800',
    'vencido': 'bg-red-100 text-red-800',
    'vigente': 'bg-blue-100 text-blue-800',
    'vencido_apto': 'bg-yellow-100 text-yellow-800'
  }
  
  return `${baseClasses} ${statusClasses[props.status] || 'bg-gray-100 text-gray-800'}`
})
</script>
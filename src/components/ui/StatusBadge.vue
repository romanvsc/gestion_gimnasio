<template>
  <span :class="badgeClasses">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value)
  }
})

const badgeClasses = computed(() => {
  const sizeClasses = {
    'sm': 'px-2 py-0.5 text-xs',
    'md': 'px-2.5 py-0.5 text-xs'
  }
  
  const baseClasses = `inline-flex items-center rounded-full font-medium ${sizeClasses[props.size]}`
  
  // Mapeo de status (para socios)
  const statusClasses = {
    'activo': 'bg-green-100 text-green-800',
    'vencido': 'bg-red-100 text-red-800',
    'vigente': 'bg-blue-100 text-blue-800',
    'vencido_apto': 'bg-yellow-100 text-yellow-800'
  }
  
  // Mapeo de type (para uso general)
  const typeClasses = {
    'success': 'bg-green-100 text-green-800',
    'danger': 'bg-red-100 text-red-800',
    'warning': 'bg-yellow-100 text-yellow-800',
    'info': 'bg-blue-100 text-blue-800',
    'secondary': 'bg-gray-100 text-gray-800'
  }
  
  // Usar status si existe, sino type, sino default
  const colorClass = statusClasses[props.status] || typeClasses[props.type] || 'bg-gray-100 text-gray-800'
  
  return `${baseClasses} ${colorClass}`
})
</script>
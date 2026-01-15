<template>
  <span :class="badgeClasses">
    <slot>{{ displayText }}</slot>
  </span>
</template>

<script setup>
import { computed, useSlots } from 'vue'

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
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const slots = useSlots()

const badgeClasses = computed(() => {
  const sizeClasses = {
    'sm': 'px-2 py-0.5 text-xs',
    'md': 'px-2.5 py-1 text-xs',
    'lg': 'px-3 py-1.5 text-sm'
  }
  
  const baseClasses = `inline-flex items-center rounded-full font-medium border ${sizeClasses[props.size]}`
  
  // Mapeo de status para estados de cuota
  const cuotaStatusClasses = {
    'activo': 'bg-green-100 text-green-800 border-green-200',
    'al_dia': 'bg-green-100 text-green-800 border-green-200',
    'vencido': 'bg-red-100 text-red-800 border-red-200',
    'por_vencer': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'sin_pagos': 'bg-gray-100 text-gray-700 border-gray-200'
  }
  
  // Mapeo de status para estados de apto físico
  const aptoStatusClasses = {
    'vigente': 'bg-blue-100 text-blue-800 border-blue-200',
    'vencido': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'por_vencer': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'sin_apto': 'bg-gray-100 text-gray-700 border-gray-200',
    '': 'bg-gray-100 text-gray-700 border-gray-200'
  }
  
  // Mapeo de type (para uso general)
  const typeClasses = {
    'success': 'bg-green-100 text-green-800 border-green-200',
    'danger': 'bg-red-100 text-red-800 border-red-200',
    'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'info': 'bg-blue-100 text-blue-800 border-blue-200',
    'secondary': 'bg-gray-100 text-gray-800 border-gray-200',
    'cuota': cuotaStatusClasses[props.status] || 'bg-gray-100 text-gray-700 border-gray-200',
    'apto': aptoStatusClasses[props.status] || 'bg-gray-100 text-gray-700 border-gray-200',
    'estado': props.status === 'activo' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
  }
  
  // Usar type si existe y está definido en typeClasses, sino status, sino default
  const colorClass = typeClasses[props.type] || cuotaStatusClasses[props.status] || 'bg-gray-100 text-gray-800 border-gray-200'
  
  return `${baseClasses} ${colorClass}`
})

const displayText = computed(() => {
  // Si hay un label explícito, usarlo
  if (props.label) return props.label
  
  // Si hay contenido en el slot, no necesitamos texto
  if (slots.default) return ''
  
  // Mapeo de textos según el tipo y status
  const statusLabels = {
    // Cuota
    'activo': 'Al día',
    'al_dia': 'Al día',
    'vencido': 'Vencido',
    'por_vencer': 'Por vencer',
    'sin_pagos': 'Sin pagos',
    
    // Apto físico
    'vigente': 'Vigente',
    'sin_apto': 'Sin apto',
    
    // Estado general
    'inactivo': 'Inactivo',
  }

  return statusLabels[props.status] || props.status || ''
})
</script>
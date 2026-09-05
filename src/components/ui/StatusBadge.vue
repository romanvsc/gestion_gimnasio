<template>
  <span :class="badgeClasses">
    <slot>{{ displayText }}</slot>
  </span>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { UI_TOKENS } from '@/config/uiTokens'

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
    'activo': UI_TOKENS.tones.success,
    'al_dia': UI_TOKENS.tones.success,
    'vencido': UI_TOKENS.tones.danger,
    'por_vencer': UI_TOKENS.tones.warning,
    'sin_pagos': UI_TOKENS.tones.neutral
  }
  
  // Mapeo de status para estados de apto físico
  const aptoStatusClasses = {
    'vigente': UI_TOKENS.tones.info,
    'vencido': UI_TOKENS.tones.warning,
    'por_vencer': UI_TOKENS.tones.warning,
    'sin_apto': UI_TOKENS.tones.neutral,
    '': UI_TOKENS.tones.neutral
  }
  
  // Mapeo de type (para uso general)
  const typeClasses = {
    'success': UI_TOKENS.tones.success,
    'danger': UI_TOKENS.tones.danger,
    'warning': UI_TOKENS.tones.warning,
    'info': UI_TOKENS.tones.info,
    'secondary': UI_TOKENS.tones.neutral,
    'cuota': cuotaStatusClasses[props.status] || UI_TOKENS.tones.neutral,
    'apto': aptoStatusClasses[props.status] || UI_TOKENS.tones.neutral,
    'estado': props.status === 'activo' ? UI_TOKENS.tones.success : UI_TOKENS.tones.neutral
  }
  
  // Usar type si existe y está definido en typeClasses, sino status, sino default
  const colorClass = typeClasses[props.type] || cuotaStatusClasses[props.status] || UI_TOKENS.tones.neutral
  
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

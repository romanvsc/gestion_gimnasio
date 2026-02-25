<template>
  <div 
    :class="[
      'rounded-lg shadow-sm border-2 p-6',
      cardClasses
    ]"
  >
    <div class="flex items-center gap-3 mb-3">
      <div :class="['p-2 rounded-lg', iconBgClass]">
        <component :is="icon" :class="['w-6 h-6', iconClass]" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
    </div>
    <p :class="['text-sm font-medium', textClass]">
      {{ statusText }}
    </p>
    <p v-if="dateValue" class="text-xs text-gray-600 dark:text-gray-400 mt-2">
      {{ dateLabel }}: {{ formatDate(dateValue) }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatters'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    default: 'default' // 'success', 'danger', 'warning', 'info', 'default'
  },
  statusText: {
    type: String,
    required: true
  },
  dateLabel: {
    type: String,
    default: 'Fecha'
  },
  dateValue: {
    type: String,
    default: null
  }
})

const cardClasses = computed(() => {
  const classes = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
    default: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }
  return classes[props.status] || classes.default
})

const iconBgClass = computed(() => {
  const classes = {
    success: 'bg-emerald-100 dark:bg-emerald-800/40',
    danger: 'bg-red-100 dark:bg-red-800/40',
    warning: 'bg-yellow-100 dark:bg-yellow-800/40',
    info: 'bg-blue-100 dark:bg-blue-800/40',
    default: 'bg-gray-100 dark:bg-gray-700'
  }
  return classes[props.status] || classes.default
})

const iconClass = computed(() => {
  const classes = {
    success: 'text-emerald-700',
    danger: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-600',
    default: 'text-gray-600'
  }
  return classes[props.status] || classes.default
})

const textClass = computed(() => {
  const classes = {
    success: 'text-emerald-700',
    danger: 'text-red-700',
    warning: 'text-yellow-800',
    info: 'text-blue-700',
    default: 'text-gray-700'
  }
  return classes[props.status] || classes.default
})
</script>

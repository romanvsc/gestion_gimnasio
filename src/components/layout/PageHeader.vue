<template>
  <div class="mb-8">
    <!-- Botón Volver -->
    <div v-if="showBack" class="mb-4">
      <BaseButton variant="ghost" @click="handleBack">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Volver
      </BaseButton>
    </div>
    
    <!-- Contenedor del Header -->
    <div :class="[
      'flex flex-col gap-4',
      hasActions ? 'md:flex-row md:items-center md:justify-between' : ''
    ]">
      <!-- Título y Subtítulo -->
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-1">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="subtitle || $slots.subtitle" class="text-page-subtitle">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>
      
      <!-- Slot para acciones (botones, filtros, etc) -->
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

// Icono inline para evitar dependencia externa
const ArrowLeft = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  `
}

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  backRoute: {
    type: [String, Object],
    default: null
  }
})

const emit = defineEmits(['back'])
const router = useRouter()
const slots = useSlots()

const hasActions = computed(() => !!slots.actions)

function handleBack() {
  emit('back')
  if (props.backRoute) {
    router.push(props.backRoute)
  } else {
    router.back()
  }
}
</script>

<template>
  <div :class="[
    'bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-sm border border-primary-200',
    compact ? 'p-4' : 'p-6'
  ]">
    <!-- Header colapsable (solo en modo compact/mobile) -->
    <button
      v-if="compact"
      type="button"
      class="w-full flex items-center justify-between touch-manipulation"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-3">
        <h3 class="text-base font-semibold text-gray-900">Resumen de Pago</h3>
        <!-- Mini resumen cuando está colapsado -->
        <div v-if="!isExpanded" class="flex items-center gap-2">
          <span class="text-xl font-bold text-primary-600">{{ monto ? `$${monto}` : '$0' }}</span>
          <span v-if="planName" class="text-xs text-gray-500 hidden sm:inline">• {{ planName }}</span>
        </div>
      </div>
      <!-- Chevron indicador -->
      <svg 
        :class="[
          'w-5 h-5 text-gray-500 transition-transform duration-300 ease-in-out',
          isExpanded ? 'rotate-180' : 'rotate-0'
        ]"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Header normal (desktop) -->
    <h3 v-else class="text-lg font-semibold text-gray-900 mb-4">
      Resumen de Pago
    </h3>
    
    <!-- Contenido con transición -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[500px]"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-[500px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div 
        v-show="!compact || isExpanded"
        :class="[
          'overflow-hidden',
          compact ? 'mt-4 space-y-3' : 'space-y-6'
        ]"
      >
        <!-- Monto a Pagar -->
        <div :class="[
          'text-center bg-white rounded-lg shadow-sm',
          compact ? 'py-4' : 'py-6'
        ]">
          <p class="text-xs md:text-sm text-gray-600 mb-1">Monto a Pagar</p>
          <p :class="[
            'font-bold text-primary-600',
            compact ? 'text-3xl' : 'text-4xl md:text-5xl'
          ]">
            {{ monto ? `$${monto}` : '$0' }}
          </p>
          <!-- Badge de tarifa aplicada -->
          <div v-if="tarifaBadge" class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-medium" :class="tarifaBadge.class">
            <span>{{ tarifaBadge.icon }}</span>
            <span>{{ tarifaBadge.text }}</span>
          </div>
        </div>

        <!-- Plan Seleccionado -->
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <p class="text-xs text-gray-500 uppercase font-semibold mb-1.5">Plan Seleccionado</p>
          <p class="text-sm md:text-base font-medium text-gray-900">
            {{ planName || 'Ningún plan seleccionado' }}
          </p>
        </div>

        <!-- Fechas -->
        <div class="bg-white rounded-lg p-3 shadow-sm space-y-2">
          <div>
            <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Fecha de Inicio</p>
            <p class="text-sm md:text-base font-medium text-gray-900">
              {{ fechaInicio || '—' }}
            </p>
          </div>
          <div class="border-t border-gray-100 pt-2">
            <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Fecha de Fin</p>
            <p class="text-sm md:text-base font-medium text-gray-900">
              {{ fechaFin || '—' }}
            </p>
          </div>
          <div v-if="duracion" class="border-t border-gray-100 pt-2">
            <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Duración</p>
            <p class="text-sm md:text-base font-medium text-primary-600">
              {{ duracion }} días
            </p>
          </div>
        </div>

        <!-- Método de Pago -->
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <p class="text-xs text-gray-500 uppercase font-semibold mb-1.5">Método de Pago</p>
          <p class="text-sm md:text-base font-medium text-gray-900">
            {{ metodoPago || '—' }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isExpanded = ref(false)

defineProps({
  monto: {
    type: [String, Number],
    default: ''
  },
  planName: {
    type: String,
    default: null
  },
  fechaInicio: {
    type: String,
    default: null
  },
  fechaFin: {
    type: String,
    default: null
  },
  duracion: {
    type: Number,
    default: null
  },
  metodoPago: {
    type: String,
    default: null
  },
  tarifaBadge: {
    type: Object,
    default: null
  },
  compact: {
    type: Boolean,
    default: false
  }
})
</script>

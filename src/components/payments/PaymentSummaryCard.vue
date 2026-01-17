<template>
  <div :class="[
    'bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-sm border border-primary-200 p-6',
    compact ? 'p-4' : 'p-6'
  ]">
    <h3 :class="[
      'font-semibold text-gray-900 mb-4',
      compact ? 'text-base' : 'text-lg'
    ]">
      Resumen de Pago
    </h3>
    
    <div :class="[
      'space-y-4',
      compact ? 'space-y-3' : 'space-y-6'
    ]">
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
  </div>
</template>

<script setup>
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

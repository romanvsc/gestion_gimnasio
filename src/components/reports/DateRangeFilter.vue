<template>
  <div class="bg-page-card rounded-lg shadow-md p-4">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <!-- Label y descripción -->
      <div>
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Período de Análisis</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">Selecciona el rango temporal para los reportes</p>
      </div>

      <!-- Botones de rango -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="range in dateRanges"
          :key="range.value"
          @click="selectRange(range.value)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            selectedRange === range.value
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- Información del rango seleccionado -->
    <div v-if="dateInfo" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <Calendar class="w-4 h-4" />
        <span>
          <strong>Desde:</strong> {{ dateInfo.startDate }} 
          <strong class="ml-3">Hasta:</strong> {{ dateInfo.endDate }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Calendar } from 'lucide-vue-next'

const emit = defineEmits(['change'])

const dateRanges = [
  { label: 'Último Mes', value: '1month' },
  { label: 'Último Trimestre', value: '3months' },
  { label: 'Último Semestre', value: '6months' },
  { label: 'Último Año', value: '12months' }
]

const selectedRange = ref('1month')

/**
 * Calcula las fechas de inicio y fin según el rango seleccionado
 */
const dateInfo = computed(() => {
  if (!selectedRange.value) return null

  const today = new Date()
  const endDate = new Date(today)
  endDate.setHours(23, 59, 59, 999)

  let startDate = new Date(today)
  
  switch (selectedRange.value) {
    case '1month':
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case '3months':
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case '6months':
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case '12months':
      startDate.setMonth(startDate.getMonth() - 12)
      break
  }
  
  startDate.setHours(0, 0, 0, 0)

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    startDateISO: startDate.toISOString(),
    endDateISO: endDate.toISOString()
  }
})

/**
 * Selecciona un rango y emite el evento con las fechas
 */
function selectRange(value) {
  selectedRange.value = value
  
  if (dateInfo.value) {
    emit('change', {
      range: value,
      startDate: dateInfo.value.startDateISO,
      endDate: dateInfo.value.endDateISO
    })
  }
}

/**
 * Formatea una fecha a formato legible
 */
function formatDate(date) {
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Emitir el rango inicial al montar
selectRange('1month')
</script>

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
          type="button"
          @click="selectRange(range.value)"
          :aria-pressed="selectedRange === range.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            selectedRange === range.value
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ range.label }}
        </button>
        <button
          type="button"
          :aria-pressed="selectedRange === 'custom'"
          @click="selectRange('custom')"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            selectedRange === 'custom'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          Rango personalizado
        </button>
      </div>
    </div>

    <div v-if="selectedRange === 'custom'" class="mt-4 grid grid-cols-1 gap-3 border-t border-page-border pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <BaseInput v-model="customStartDate" type="date" label="Desde" id="report-custom-start" />
      <BaseInput v-model="customEndDate" type="date" label="Hasta" id="report-custom-end" :min="customStartDate" />
      <BaseButton variant="primary" :disabled="!isCustomRangeValid" @click="applyCustomRange">
        Aplicar rango
      </BaseButton>
    </div>
    <p v-if="customRangeError" class="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
      {{ customRangeError }}
    </p>

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
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const emit = defineEmits(['change'])

const dateRanges = [
  { label: 'Último Mes', value: '1month' },
  { label: 'Último Trimestre', value: '3months' },
  { label: 'Último Semestre', value: '6months' },
  { label: 'Último Año', value: '12months' }
]

const selectedRange = ref('1month')
const customStartDate = ref('')
const customEndDate = ref('')
const customRangeError = ref('')

const isCustomRangeValid = computed(() => {
  return Boolean(customStartDate.value && customEndDate.value && customStartDate.value <= customEndDate.value)
})

/**
 * Calcula las fechas de inicio y fin según el rango seleccionado
 */
const dateInfo = computed(() => {
  if (!selectedRange.value) return null

  if (selectedRange.value === 'custom') {
    if (!isCustomRangeValid.value) return null

    const startDate = new Date(`${customStartDate.value}T00:00:00`)
    const endDate = new Date(`${customEndDate.value}T23:59:59.999`)
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      startDateISO: startDate.toISOString(),
      endDateISO: endDate.toISOString()
    }
  }

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

  if (value === 'custom') {
    customRangeError.value = ''
    return
  }
  
  if (dateInfo.value) {
    emit('change', {
      range: value,
      startDate: dateInfo.value.startDateISO,
      endDate: dateInfo.value.endDateISO
    })
  }
}

function applyCustomRange() {
  if (!customStartDate.value || !customEndDate.value) {
    customRangeError.value = 'Seleccioná una fecha de inicio y una fecha de fin.'
    return
  }

  if (customStartDate.value > customEndDate.value) {
    customRangeError.value = 'La fecha de inicio no puede ser posterior a la fecha de fin.'
    return
  }

  customRangeError.value = ''
  emit('change', {
    range: 'custom',
    startDate: dateInfo.value.startDateISO,
    endDate: dateInfo.value.endDateISO
  })
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

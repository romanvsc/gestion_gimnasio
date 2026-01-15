<template>
  <div class="relative h-full">
    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
      <div class="text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
        <p class="mt-2 text-sm text-gray-600">Cargando datos...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!chartData.labels || chartData.labels.length === 0" class="flex items-center justify-center h-full">
      <div class="text-center text-gray-500">
        <p class="text-lg font-medium">No hay datos disponibles</p>
        <p class="text-sm">Aún no hay registros de asistencia</p>
      </div>
    </div>

    <!-- Chart -->
    <Bar 
      v-else
      :data="chartData" 
      :options="chartOptions"
      class="w-full h-full"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

/**
 * Datos del gráfico
 */
const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  // Crear array con todas las horas (0-23) inicializadas en 0
  const activityByHour = Array(24).fill(0)
  
  // Llenar con los datos reales
  props.data.forEach(item => {
    const hour = parseInt(item.hora)
    activityByHour[hour] = parseInt(item.cantidad) || 0
  })

  // Calcular valor máximo para determinar horarios pico
  const maxValue = Math.max(...activityByHour)
  const peakThreshold = maxValue * 0.7 // 70% del máximo se considera "pico"

  // Generar labels (00:00 - 23:00)
  const labels = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  )

  return {
    labels,
    datasets: [
      {
        label: 'Asistencias',
        data: activityByHour,
        backgroundColor: activityByHour.map(value => 
          value >= peakThreshold 
            ? 'rgba(16, 185, 129, 0.8)'  // Verde para horarios pico
            : 'rgba(59, 130, 246, 0.8)'   // Azul para horarios normales
        ),
        borderColor: activityByHour.map(value => 
          value >= peakThreshold 
            ? 'rgb(16, 185, 129)' 
            : 'rgb(59, 130, 246)'
        ),
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 30
      }
    ]
  }
})

/**
 * Opciones del gráfico
 */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      callbacks: {
        title: function(context) {
          const hour = context[0].label
          return `Horario: ${hour}`
        },
        label: function(context) {
          const value = context.parsed.y
          return `Asistencias: ${value.toLocaleString('es-AR')}`
        },
        afterLabel: function(context) {
          const maxValue = Math.max(...context.dataset.data)
          const value = context.parsed.y
          const peakThreshold = maxValue * 0.7
          
          if (value >= peakThreshold && value > 0) {
            return '🔥 Horario Pico'
          }
          return ''
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 9
        },
        maxRotation: 45,
        minRotation: 45,
        callback: function(value, index) {
          // Mostrar solo cada 2 horas para evitar saturación
          return index % 2 === 0 ? this.getLabelForValue(value) : ''
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 11
        },
        stepSize: 1,
        callback: function(value) {
          return Number.isInteger(value) ? value : ''
        }
      }
    }
  }
}
</script>

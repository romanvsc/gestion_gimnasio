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

// Mapeo de día de semana (0=Domingo, 6=Sábado)
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

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

  // Crear array con todos los días (0-6) inicializados en 0
  const activityByDay = Array(7).fill(0)
  
  // Llenar con los datos reales
  props.data.forEach(item => {
    const dayIndex = parseInt(item.dia_semana)
    activityByDay[dayIndex] = parseInt(item.cantidad) || 0
  })

  return {
    labels: dayNames,
    datasets: [
      {
        label: 'Asistencias',
        data: activityByDay,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Domingo - Rojo (día libre)
          'rgba(59, 130, 246, 0.8)',   // Lunes
          'rgba(59, 130, 246, 0.8)',   // Martes
          'rgba(59, 130, 246, 0.8)',   // Miércoles
          'rgba(59, 130, 246, 0.8)',   // Jueves
          'rgba(59, 130, 246, 0.8)',   // Viernes
          'rgba(251, 146, 60, 0.8)'    // Sábado - Naranja (medio día)
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(59, 130, 246)',
          'rgb(59, 130, 246)',
          'rgb(59, 130, 246)',
          'rgb(59, 130, 246)',
          'rgb(251, 146, 60)'
        ],
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 60
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
        label: function(context) {
          const value = context.parsed.y
          return `Asistencias: ${value.toLocaleString('es-AR')}`
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
          size: 12,
          weight: '500'
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

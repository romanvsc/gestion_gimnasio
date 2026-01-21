<template>
  <div>
    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="flex flex-col justify-center items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
        <span class="text-3xl font-bold text-gray-800">{{ totalWeek }}</span>
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Total Semanal</span>
      </div>
      
      <div class="flex flex-col justify-center items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
        <span class="text-3xl font-bold text-gray-800">{{ averageDaily }}</span>
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Promedio Diario</span>
      </div>

      <div class="flex flex-col justify-center items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
        <span class="text-3xl font-bold text-primary-600">{{ bestDay.day }}</span>
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Mejor Día ({{ bestDay.count }})</span>
      </div>
    </div>

    <!-- Gráfico de barras con Chart.js -->
    <div class="h-64">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
import { supabase } from '@/lib/supabase'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const weekData = ref([
  { day: 'Lun', fullDay: 'Lunes', count: 0 },
  { day: 'Mar', fullDay: 'Martes', count: 0 },
  { day: 'Mié', fullDay: 'Miércoles', count: 0 },
  { day: 'Jue', fullDay: 'Jueves', count: 0 },
  { day: 'Vie', fullDay: 'Viernes', count: 0 },
  { day: 'Sáb', fullDay: 'Sábado', count: 0 },
  { day: 'Dom', fullDay: 'Domingo', count: 0 }
])

const totalWeek = computed(() => {
  return weekData.value.reduce((sum, d) => sum + d.count, 0)
})

const averageDaily = computed(() => {
  const avg = totalWeek.value / 7
  return avg.toFixed(1)
})

const bestDay = computed(() => {
  const best = weekData.value.reduce((max, day) => 
    day.count > max.count ? day : max, weekData.value[0]
  )
  return best
})

const chartData = computed(() => ({
  labels: weekData.value.map(d => d.day),
  datasets: [
    {
      label: 'Visitas',
      data: weekData.value.map(d => d.count),
      backgroundColor: weekData.value.map((d, index) => {
        // Destacar el día actual
        const today = new Date()
        const todayIndex = (today.getDay() + 6) % 7
        if (index === todayIndex) {
          return 'rgba(95, 56, 140, 1)' // primary-600 sólido para hoy
        }
        return 'rgba(95, 56, 140, 0.6)' // primary-600 con transparencia
      }),
      borderColor: 'rgba(95, 56, 140, 1)',
      borderWidth: 0,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(95, 56, 140, 0.9)',
      barThickness: 'flex',
      maxBarThickness: 50
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      callbacks: {
        title: (context) => {
          const index = context[0].dataIndex
          return weekData.value[index].fullDay
        },
        label: (context) => {
          const value = context.parsed.y
          return `${value} ${value === 1 ? 'visita' : 'visitas'}`
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
        },
        color: '#6b7280'
      },
      border: {
        display: false
      }
    },
    y: {
      grid: {
        color: 'rgba(229, 231, 235, 0.5)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11
        },
        color: '#9ca3af',
        stepSize: 1,
        callback: (value) => {
          if (Number.isInteger(value)) {
            return value
          }
          return ''
        }
      },
      border: {
        display: false
      },
      beginAtZero: true
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  animation: {
    duration: 800,
    easing: 'easeOutQuart'
  }
}

async function loadWeekData() {
  try {
    // Obtener datos de los últimos 7 días reales
    const today = new Date()
    const lastWeek = new Date(today)
    lastWeek.setDate(today.getDate() - 6)
    lastWeek.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('attendance')
      .select('created_at')
      .gte('created_at', lastWeek.toISOString())

    if (error) throw error

    if (data) {
      // Contar por día de la semana
      const counts = [0, 0, 0, 0, 0, 0, 0]
      data.forEach(item => {
        const date = new Date(item.created_at)
        const dayIndex = (date.getDay() + 6) % 7 // Ajustar para que Lun=0
        counts[dayIndex]++
      })

      weekData.value = weekData.value.map((day, index) => ({
        ...day,
        count: counts[index]
      }))
    }
  } catch (error) {
    console.error('Error cargando datos de asistencia:', error)
  }
}

onMounted(() => {
  loadWeekData()
})
</script>
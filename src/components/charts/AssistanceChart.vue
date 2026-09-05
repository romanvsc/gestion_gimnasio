<template>
  <div>
    <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-base font-bold text-page-title">Asistencia semanal</h2>
        <p class="mt-1 text-xs text-page-subtitle">
          {{ totalWeek }} {{ totalWeek === 1 ? 'acceso' : 'accesos' }} · promedio {{ averageDaily }}/día · mejor día: {{ bestDay.fullDay.toLowerCase() }}
        </p>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-400">
        Últimos 7 días
      </span>
    </div>

    <!-- Gráfico de barras con Chart.js -->
    <div
      class="h-56 sm:h-60 md:h-[260px] xl:h-[280px]"
      role="img"
      :aria-label="`Asistencia semanal: ${totalWeek} ${totalWeek === 1 ? 'acceso' : 'accesos'}. Mejor día: ${bestDay.fullDay}, con ${bestDay.count} ${bestDay.count === 1 ? 'acceso' : 'accesos'}.`"
    >
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
import { BRAND, COLOR_SCALES, colorToRgba } from '@/config/brand'
import { useReports } from '@/composables/useReports'
import { useTheme } from '@/composables/useTheme'
import { reportClientError } from '@/lib/observability'

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
const { fetchAttendanceByRange } = useReports()
const { isDark } = useTheme()

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
          return colorToRgba(BRAND.colors.primary, 1)
        }
        return colorToRgba(BRAND.colors.primary, 0.6)
      }),
      borderColor: colorToRgba(BRAND.colors.primary, 1),
      borderWidth: 0,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: colorToRgba(BRAND.colors.primary, 0.9),
      barThickness: 'flex',
      maxBarThickness: 50
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: colorToRgba(COLOR_SCALES.neutral[800], 0.95),
      padding: 10,
      cornerRadius: 6,
      displayColors: false,
      titleFont: {
        size: 13,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
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
          size: 11,
          weight: '500'
        },
        color: isDark.value ? COLOR_SCALES.neutral[400] : COLOR_SCALES.neutral[500]
      },
      border: {
        display: false
      }
    },
    y: {
      grid: {
        color: colorToRgba(isDark.value ? COLOR_SCALES.secondary[700] : COLOR_SCALES.neutral[200], 0.55),
        drawBorder: false
      },
      ticks: {
        font: {
          size: 10
        },
        color: isDark.value ? COLOR_SCALES.neutral[400] : COLOR_SCALES.neutral[500],
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
    duration: 500,
    easing: 'easeOutQuart'
  }
}))

async function loadWeekData() {
  try {
    // Obtener datos de los últimos 7 días reales
    const today = new Date()
    const lastWeek = new Date(today)
    lastWeek.setDate(today.getDate() - 6)
    lastWeek.setHours(0, 0, 0, 0)

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 1)
    const result = await fetchAttendanceByRange(lastWeek.toISOString(), endDate.toISOString())

    if (result.success) {
      // Contar por día de la semana
      const counts = [0, 0, 0, 0, 0, 0, 0]
      result.data.forEach(item => {
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
    reportClientError('reports.assistance_chart', error)
  }
}

onMounted(() => {
  loadWeekData()
})
</script>

<template>
  <div style="height: 300px;">
    <!-- Gráfico de línea con Chart.js -->
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { formatCurrencyFull } from '@/utils/formatters'
import { BRAND, COLOR_SCALES, colorToRgba } from '@/config/brand'
import { useReports } from '@/composables/useReports'
import { reportClientError } from '@/lib/observability'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const monthsData = ref([
  { month: 'Ene', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
  { month: 'Abr', amount: 0 },
  { month: 'May', amount: 0 },
  { month: 'Jun', amount: 0 }
])
const { fetchRevenueByRange } = useReports()

const chartData = computed(() => ({
  labels: monthsData.value.map(m => m.month),
  datasets: [
    {
      label: 'Ingresos',
      data: monthsData.value.map(m => m.amount),
      borderColor: BRAND.colors.primary,
      backgroundColor: colorToRgba(BRAND.colors.primary, 0.1),
      borderWidth: 3,
      fill: true,
      tension: 0.4, // Línea curva
      pointRadius: 5,
      pointBackgroundColor: BRAND.colors.primary,
      pointBorderColor: COLOR_SCALES.neutral[50],
      pointBorderWidth: 2,
      pointHoverRadius: 7,
      pointHoverBorderWidth: 3
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: colorToRgba(COLOR_SCALES.neutral[950], 0.8),
      padding: 12,
      borderRadius: 8,
      displayColors: false,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 13
      },
      callbacks: {
        label: (context) => {
          return formatCurrencyFull(context.parsed.y)
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false // Sin líneas de cuadrícula en X
      },
      ticks: {
        font: {
          size: 12
        },
          color: COLOR_SCALES.neutral[500]
      },
      border: {
        display: false
      }
    },
    y: {
      grid: {
        display: false // Sin líneas de cuadrícula en Y
      },
      ticks: {
        font: {
          size: 12
        },
        color: COLOR_SCALES.neutral[500],
        callback: (value) => {
          return formatCurrencyFull(value)
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
  }
}

const averageRevenue = computed(() => {
  const total = monthsData.value.reduce((sum, d) => sum + d.amount, 0)
  return total / monthsData.value.length
})

async function loadRevenueData() {
  try {
    // Obtener pagos de los últimos 6 meses
    const today = new Date()
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const amounts = [0, 0, 0, 0, 0, 0]

    const startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1)
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const result = await fetchRevenueByRange(startDate.toISOString(), endDate.toISOString())

    for (let index = 0; index < 6; index++) {
      const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      amounts[index] = (result.data || [])
        .filter(payment => {
          const paymentDate = new Date(payment.created_at)
          return `${paymentDate.getFullYear()}-${paymentDate.getMonth()}` === monthKey
        })
        .reduce((sum, payment) => sum + Number(payment.monto), 0)
      monthsData.value[index] = {
        month: monthNames[date.getMonth()],
        amount: amounts[index]
      }
    }
  } catch (error) {
    reportClientError('reports.revenue_chart', error)
  }
}

onMounted(() => {
  loadRevenueData()
})
</script>

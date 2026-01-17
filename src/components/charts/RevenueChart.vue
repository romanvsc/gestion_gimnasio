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
import { supabase } from '@/lib/supabase'

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

const chartData = computed(() => ({
  labels: monthsData.value.map(m => m.month),
  datasets: [
    {
      label: 'Ingresos',
      data: monthsData.value.map(m => m.amount),
      borderColor: '#5F388C', // primary-600
      backgroundColor: 'rgba(95, 56, 140, 0.1)', // primary-600 con transparencia
      borderWidth: 3,
      fill: true,
      tension: 0.4, // Línea curva
      pointRadius: 5,
      pointBackgroundColor: '#5F388C',
      pointBorderColor: '#fff',
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
          return `$${context.parsed.y.toLocaleString('es-AR')}`
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
        color: '#6b7280' // gray-500
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
        color: '#6b7280', // gray-500
        callback: (value) => {
          if (value === 0) return '$0'
          return `$${(value / 1000).toFixed(0)}k`
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

function formatNumber(value) {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

async function loadRevenueData() {
  try {
    // Obtener pagos de los últimos 6 meses
    const today = new Date()
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const amounts = [0, 0, 0, 0, 0, 0]

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1)

      const { data } = await supabase
        .from('payments')
        .select('monto')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextMonth.toISOString())

      if (data) {
        amounts[5 - i] = data.reduce((sum, p) => sum + Number(p.monto), 0)
        monthsData.value[5 - i] = {
          month: monthNames[date.getMonth()],
          amount: amounts[5 - i]
        }
      }
    }
  } catch (error) {
    console.error('Error cargando datos de ingresos:', error)
  }
}

onMounted(() => {
  loadRevenueData()
})
</script>
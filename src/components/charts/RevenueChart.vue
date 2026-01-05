<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Ingresos Mensuales</h3>
    
    <!-- Gráfico simple con barras CSS -->
    <div class="space-y-3">
      <div v-for="month in monthsData" :key="month.month" class="flex items-center">
        <div class="w-16 text-sm text-gray-600">{{ month.month }}</div>
        <div class="flex-1 bg-gray-100 rounded-full h-8 relative">
          <div 
            class="bg-green-500 h-full rounded-full flex items-center justify-end pr-2"
            :style="{ width: `${(month.amount / maxAmount) * 100}%` }"
          >
            <span class="text-white text-xs font-medium">${{ formatNumber(month.amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 text-sm text-gray-500 text-center">
      Promedio mensual: ${{ formatNumber(averageRevenue) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const monthsData = ref([
  { month: 'Ene', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
  { month: 'Abr', amount: 0 },
  { month: 'May', amount: 0 },
  { month: 'Jun', amount: 0 }
])

const maxAmount = computed(() => {
  return Math.max(...monthsData.value.map(d => d.amount), 1)
})

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
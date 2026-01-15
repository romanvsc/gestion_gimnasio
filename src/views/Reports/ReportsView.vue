<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Reportes y Análisis</h1>
        <p class="text-gray-600">Métricas clave para la toma de decisiones</p>
      </div>

      <!-- Sección 1: Análisis Financiero -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">Análisis Financiero</h2>
            <p class="text-sm text-gray-600">Ingresos vs Egresos - Últimos 12 meses</p>
          </div>
          <div v-if="loading.finance" class="flex items-center gap-2 text-sm text-gray-500">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-solid border-emerald-500 border-r-transparent"></div>
            Cargando...
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6" style="height: 400px;">
          <FinanceChart :data="financeData" :loading="loading.finance" />
        </div>
      </section>

      <!-- Sección 2: Patrones de Actividad -->
      <section class="mb-8">
        <div class="mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Patrones de Actividad</h2>
          <p class="text-sm text-gray-600">Análisis de asistencia - Últimos 30 días</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6">
          
          <!-- Gráfico 1: Actividad por Día -->
          <div class="bg-white rounded-lg shadow-md p-6" style="height: 350px;">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-800">Actividad por Día de la Semana</h3>
              <div v-if="loading.daily" class="flex items-center gap-2 text-xs text-gray-500">
                <div class="h-3 w-3 animate-spin rounded-full border-2 border-solid border-emerald-500 border-r-transparent"></div>
                Cargando...
              </div>
            </div>
            <div style="height: calc(100% - 40px);">
              <DailyActivityChart :data="dailyData" :loading="loading.daily" />
            </div>
          </div>

          <!-- Gráfico 2: Horarios Pico -->
          <div class="bg-white rounded-lg shadow-md p-6" style="height: 350px;">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-800">Horarios Pico</h3>
              <div v-if="loading.hourly" class="flex items-center gap-2 text-xs text-gray-500">
                <div class="h-3 w-3 animate-spin rounded-full border-2 border-solid border-emerald-500 border-r-transparent"></div>
                Cargando...
              </div>
            </div>
            <div style="height: calc(100% - 40px);">
              <HourlyActivityChart :data="hourlyData" :loading="loading.hourly" />
            </div>
          </div>

        </div>
      </section>

      <!-- Sección 3: Alertas de Socios -->
      <section>
        <div class="mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Alertas de Socios</h2>
          <p class="text-sm text-gray-600">Situaciones que requieren atención</p>
        </div>
        
        <MemberAlerts />
      </section>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useReports } from '@/composables/useReports'
import FinanceChart from '@/components/reports/FinanceChart.vue'
import DailyActivityChart from '@/components/reports/DailyActivityChart.vue'
import HourlyActivityChart from '@/components/reports/HourlyActivityChart.vue'
import MemberAlerts from '@/components/reports/MemberAlerts.vue'

const { 
  financeData, 
  dailyData, 
  hourlyData,
  loading,
  fetchFinanceStats,
  fetchDailyActivity,
  fetchHourlyActivity
} = useReports()

onMounted(async () => {
  // Cargar todos los datos en paralelo
  await Promise.all([
    fetchFinanceStats(),
    fetchDailyActivity(),
    fetchHourlyActivity()
  ])
})
</script>

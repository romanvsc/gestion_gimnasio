<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">Reportes y Análisis</h1>
        <p class="text-page-subtitle">Métricas clave para la toma de decisiones estratégicas</p>
      </div>

      <!-- Filtro de Rango de Fechas -->
      <div class="mb-8">
        <DateRangeFilter @change="handleDateRangeChange" />
      </div>

      <!-- Sección 1: Análisis Financiero -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">Análisis Financiero</h2>
            <p class="text-sm text-gray-600">Evolución de Ingresos vs Egresos</p>
          </div>
          <div v-if="loading.finance" class="flex items-center gap-2 text-sm text-gray-500">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"></div>
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
          <p class="text-sm text-gray-600">Análisis de asistencia en el período seleccionado</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6">
          
          <!-- Gráfico 1: Actividad por Día -->
          <div class="bg-white rounded-lg shadow-md p-6" style="height: 350px;">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-800">Actividad por Día de la Semana</h3>
              <div v-if="loading.daily" class="flex items-center gap-2 text-xs text-gray-500">
                <div class="h-3 w-3 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"></div>
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
                <div class="h-3 w-3 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"></div>
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
import { ref, onMounted } from 'vue'
import { useReports } from '@/composables/useReports'
import DateRangeFilter from '@/components/reports/DateRangeFilter.vue'
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

// Estado del rango de fechas seleccionado
const currentDateRange = ref({
  startDate: null,
  endDate: null
})

/**
 * Maneja el cambio de rango de fechas desde el filtro
 */
async function handleDateRangeChange({ range, startDate, endDate }) {
  currentDateRange.value = { startDate, endDate }
  
  // Recargar todos los datos con el nuevo rango
  await loadReports(startDate, endDate)
}

/**
 * Carga todos los reportes con el rango de fechas especificado
 */
async function loadReports(startDate, endDate) {
  await Promise.all([
    fetchFinanceStats(startDate, endDate),
    fetchDailyActivity(startDate, endDate),
    fetchHourlyActivity(startDate, endDate)
  ])
}

// La carga inicial se hará cuando el DateRangeFilter emita su primer evento
// (automáticamente al montarse con el rango por defecto)
</script>

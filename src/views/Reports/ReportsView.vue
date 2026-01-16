<template>
  <div class="bg-page-bg min-h-screen pb-24 md:pb-8">
    <div class="max-w-7xl mx-auto px-4 py-6 md:py-8">
      
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">Reportes y Análisis</h1>
        <p class="text-page-subtitle">Métricas clave para la toma de decisiones estratégicas</p>
      </div>

      <!-- Filtro de Rango de Fechas -->
      <div class="mb-6">
        <DateRangeFilter @change="handleDateRangeChange" />
      </div>

      <!-- Sección 1: Análisis Financiero -->
      <section class="mb-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 class="font-semibold text-page-title">Análisis Financiero</h2>
                <p class="text-sm text-page-subtitle">Evolución de Ingresos vs Egresos</p>
              </div>
            </div>
            <div v-if="loading.finance" class="flex items-center gap-2 text-sm text-page-subtitle">
              <Loader2 class="w-4 h-4 animate-spin" />
              <span class="hidden sm:inline">Cargando...</span>
            </div>
          </div>
          
          <div class="p-4 md:p-6 h-80 md:h-96">
            <FinanceChart :data="financeData" :loading="loading.finance" />
          </div>
        </div>
      </section>

      <!-- Sección 2: Patrones de Actividad -->
      <section class="mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Activity class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 class="font-semibold text-page-title">Patrones de Actividad</h2>
            <p class="text-sm text-page-subtitle">Análisis de asistencia en el período</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Gráfico 1: Actividad por Día -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-medium text-page-title">Actividad por Día</h3>
              <Loader2 v-if="loading.daily" class="w-4 h-4 animate-spin text-page-muted" />
            </div>
            <div class="p-4 h-64">
              <DailyActivityChart :data="dailyData" :loading="loading.daily" />
            </div>
          </div>

          <!-- Gráfico 2: Horarios Pico -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-medium text-page-title">Horarios Pico</h3>
              <Loader2 v-if="loading.hourly" class="w-4 h-4 animate-spin text-page-muted" />
            </div>
            <div class="p-4 h-64">
              <HourlyActivityChart :data="hourlyData" :loading="loading.hourly" />
            </div>
          </div>

        </div>
      </section>

      <!-- Sección 3: Alertas de Socios -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 class="font-semibold text-page-title">Alertas de Socios</h2>
            <p class="text-sm text-page-subtitle">Situaciones que requieren atención</p>
          </div>
        </div>
        
        <MemberAlerts />
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReports } from '@/composables/useReports'
import DateRangeFilter from '@/components/reports/DateRangeFilter.vue'
import FinanceChart from '@/components/reports/FinanceChart.vue'
import DailyActivityChart from '@/components/reports/DailyActivityChart.vue'
import HourlyActivityChart from '@/components/reports/HourlyActivityChart.vue'
import MemberAlerts from '@/components/reports/MemberAlerts.vue'
import { 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  Loader2
} from 'lucide-vue-next'

const { 
  financeData, 
  dailyData, 
  hourlyData,
  loading,
  fetchFinanceStats,
  fetchDailyActivity,
  fetchHourlyActivity
} = useReports()

const currentDateRange = ref({
  startDate: null,
  endDate: null
})

async function handleDateRangeChange({ range, startDate, endDate }) {
  currentDateRange.value = { startDate, endDate }
  await loadReports(startDate, endDate)
}

async function loadReports(startDate, endDate) {
  await Promise.all([
    fetchFinanceStats(startDate, endDate),
    fetchDailyActivity(startDate, endDate),
    fetchHourlyActivity(startDate, endDate)
  ])
}
</script>

<template>
  <div class="bg-page-bg min-h-screen pb-24 md:pb-8">
    <div class="max-w-[1440px] mx-auto px-4 py-6 md:px-6 md:py-8 xl:px-8">
      
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">Reportes y Análisis</h1>
        <p class="text-page-subtitle">Métricas clave para la toma de decisiones estratégicas</p>
      </div>

      <!-- Filtro de Rango de Fechas -->
      <div class="mb-6">
        <DateRangeFilter @change="handleDateRangeChange" />
      </div>

      <section v-if="financeSummary.hasData" class="mb-6 rounded-2xl border border-page-border bg-page-card p-4 md:p-5" aria-live="polite">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="font-semibold text-page-title">Resumen del período</h2>
            <p class="text-sm text-page-subtitle">Una lectura rápida de los datos seleccionados</p>
          </div>
          <span v-if="financeSummary.isSparse" class="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            Pocos datos para comparar
          </span>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Ingresos</p>
            <p class="mt-1 text-xl font-bold text-emerald-800 dark:text-emerald-200">{{ formatCurrencyFull(financeSummary.income) }}</p>
          </div>
          <div class="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <p class="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">Egresos</p>
            <p class="mt-1 text-xl font-bold text-red-800 dark:text-red-200">{{ formatCurrencyFull(financeSummary.expense) }}</p>
          </div>
          <div class="rounded-xl bg-primary-50 p-4 dark:bg-primary-900/20">
            <p class="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">Balance</p>
            <p class="mt-1 text-xl font-bold text-primary-800 dark:text-primary-200">{{ formatCurrencyFull(financeSummary.balance) }}</p>
          </div>
        </div>
        <p class="mt-4 text-sm text-page-subtitle">{{ financeSummary.message }}</p>
      </section>

      <section v-if="activitySummary.hasData" class="mb-6 rounded-2xl border border-page-border bg-page-card p-4 md:p-5" aria-live="polite">
        <div class="mb-4">
          <h2 class="font-semibold text-page-title">Lectura rápida de asistencia</h2>
          <p class="text-sm text-page-subtitle">Una guía para convertir los gráficos en una decisión operativa</p>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="rounded-xl bg-secondary-50 p-4 dark:bg-secondary-900/20">
            <p class="text-xs font-semibold uppercase tracking-wide text-secondary-700 dark:text-secondary-300">Día con más asistencia</p>
            <p class="mt-1 text-lg font-bold text-secondary-900 dark:text-secondary-100">
              {{ activitySummary.peakDay.label }}
              <span v-if="activitySummary.peakDay.count > 0" class="text-sm font-medium">({{ activitySummary.peakDay.count }} visitas)</span>
            </p>
          </div>
          <div class="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <p class="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Horario pico</p>
            <p class="mt-1 text-lg font-bold text-blue-900 dark:text-blue-100">
              {{ activitySummary.peakHour.label }}
              <span v-if="activitySummary.peakHour.count > 0" class="text-sm font-medium">({{ activitySummary.peakHour.count }} visitas)</span>
            </p>
          </div>
        </div>
        <p class="mt-4 text-sm text-page-subtitle">{{ activitySummary.message }}</p>
      </section>

      <!-- Sección 1: Análisis Financiero -->
      <section class="mb-6">
        <div class="bg-page-card rounded-2xl shadow-sm border border-page-border overflow-hidden">
          <div class="p-4 md:p-6 border-b border-page-border flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
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
          
          <div class="p-4 md:p-6 h-72 xl:h-96">
            <FinanceChart :data="financeData" :loading="loading.finance" />
          </div>
        </div>
      </section>

      <!-- Sección 2: Patrones de Actividad -->
      <section class="mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
            <Activity class="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <h2 class="font-semibold text-page-title">Patrones de Actividad</h2>
            <p class="text-sm text-page-subtitle">Análisis de asistencia en el período</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          
          <!-- Gráfico 1: Actividad por Día -->
          <div class="bg-page-card rounded-2xl shadow-sm border border-page-border overflow-hidden">
            <div class="p-4 border-b border-page-border flex items-center justify-between">
              <h3 class="font-medium text-page-title">Actividad por Día</h3>
              <Loader2 v-if="loading.daily" class="w-4 h-4 animate-spin text-page-muted" />
            </div>
            <div class="p-4 h-56 xl:h-64">
              <DailyActivityChart :data="dailyData" :loading="loading.daily" />
            </div>
          </div>

          <!-- Gráfico 2: Horarios Pico -->
          <div class="bg-page-card rounded-2xl shadow-sm border border-page-border overflow-hidden">
            <div class="p-4 border-b border-page-border flex items-center justify-between">
              <h3 class="font-medium text-page-title">Horarios Pico</h3>
              <Loader2 v-if="loading.hourly" class="w-4 h-4 animate-spin text-page-muted" />
            </div>
            <div class="p-4 h-56 xl:h-64">
              <HourlyActivityChart :data="hourlyData" :loading="loading.hourly" />
            </div>
          </div>

        </div>
      </section>

      <!-- Sección 3: Alertas de Socios -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
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
import { ref, computed } from 'vue'
import { useReports } from '@/composables/useReports'
import { useAppResume } from '@/composables/useAppResume'
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
import { formatCurrencyFull } from '@/utils/formatters'

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

const financeSummary = computed(() => {
  const income = financeData.value.reduce((total, item) => total + (Number(item.ingresos) || 0), 0)
  const expense = financeData.value.reduce((total, item) => total + (Number(item.egresos) || 0), 0)
  const balance = income - expense
  const isSparse = financeData.value.length < 2

  return {
    income,
    expense,
    balance,
    hasData: financeData.value.length > 0,
    isSparse,
    message: isSparse
      ? 'El período tiene un solo punto de referencia; usá un rango más amplio para comparar tendencias.'
      : `El balance del período es ${formatCurrencyFull(balance)}.`
  }
})

const activitySummary = computed(() => {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const dayTotals = Array(7).fill(0)
  const hourTotals = Array(24).fill(0)

  dailyData.value.forEach((item) => {
    const dayIndex = Number(item.dia_semana)
    if (Number.isInteger(dayIndex) && dayIndex >= 0 && dayIndex < 7) {
      dayTotals[dayIndex] = Number(item.cantidad) || 0
    }
  })

  hourlyData.value.forEach((item) => {
    const hour = Number(item.hora)
    if (Number.isInteger(hour) && hour >= 0 && hour < 24) {
      hourTotals[hour] = Number(item.cantidad) || 0
    }
  })

  const peakDayCount = Math.max(...dayTotals, 0)
  const peakHourCount = Math.max(...hourTotals, 0)
  const peakDayIndex = dayTotals.indexOf(peakDayCount)
  const peakHourIndex = hourTotals.indexOf(peakHourCount)
  const hasData = dailyData.value.length > 0 || hourlyData.value.length > 0

  return {
    hasData,
    peakDay: {
      label: peakDayCount > 0 ? dayNames[peakDayIndex] : 'Sin visitas registradas',
      count: peakDayCount
    },
    peakHour: {
      label: peakHourCount > 0 ? `${String(peakHourIndex).padStart(2, '0')}:00` : 'Sin visitas registradas',
      count: peakHourCount
    },
    message: peakDayCount > 0 && peakHourCount > 0
      ? `Podés reforzar la recepción los ${dayNames[peakDayIndex]} y preparar recursos cerca de las ${String(peakHourIndex).padStart(2, '0')}:00.`
      : 'El rango todavía no tiene suficientes asistencias para identificar un patrón confiable.'
  }
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

async function refreshCurrentRangeReports() {
  if (!currentDateRange.value.startDate || !currentDateRange.value.endDate) return
  await loadReports(currentDateRange.value.startDate, currentDateRange.value.endDate)
}

useAppResume(async () => {
  await refreshCurrentRangeReports()
}, { minIntervalMs: 1500 })
</script>

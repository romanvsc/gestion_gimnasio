<template>
  <div class="bg-page-bg min-h-screen transition-colors duration-200">
    <div class="max-w-[1440px] mx-auto px-4 py-6 md:px-6 md:py-8 xl:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-page-title mb-2">Gestión de Caja</h1>
            <p class="text-page-subtitle">Control de ingresos y egresos por período</p>
          </div>
          
          <!-- Selector de Rango de Fechas -->
          <div class="flex flex-col xl:flex-row gap-3 w-full xl:w-auto">
            <div class="w-full xl:w-48">
              <BaseInput
                v-model="startDate"
                type="date"
                label="Fecha Inicio"
              />
            </div>
            <div class="w-full xl:w-48">
              <BaseInput
                v-model="endDate"
                type="date"
                label="Fecha Fin"
                :min="startDate"
              />
            </div>
            <div class="flex items-end">
              <BaseButton
                variant="primary"
                @click="handleFilterClick"
                class="w-full xl:w-auto"
              >
                Filtrar
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid de Resumen (4 tarjetas) -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <!-- Saldo Inicial del Período -->
        <div class="bg-page-card rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-page-subtitle text-sm font-medium mb-2">Saldo Inicial del Período</p>
              <p class="text-page-title text-3xl font-bold mb-1">
                {{ formatCurrencyFull(balanceAnterior) }}
              </p>
              <span class="text-sm text-gray-500 dark:text-gray-400">Al inicio del rango</span>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
              <Calendar class="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>

        <!-- Ingresos -->
        <div class="bg-page-card rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-page-subtitle text-sm font-medium mb-2">Ingresos</p>
              <p class="text-page-title text-3xl font-bold mb-1">
                {{ formatCurrencyFull(ingresosDia) }}
              </p>
              <span class="text-sm font-semibold text-emerald-600">
                {{ incomeCount }} {{ incomeCount === 1 ? 'movimiento' : 'movimientos' }}
              </span>
            </div>
            <div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
              <ArrowDownCircle class="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <!-- Egresos -->
        <div class="bg-page-card rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-page-subtitle text-sm font-medium mb-2">Egresos</p>
              <p class="text-page-title text-3xl font-bold mb-1">
                {{ formatCurrencyFull(egresosDia) }}
              </p>
          <span class="text-sm font-semibold text-red-600 dark:text-red-400">
                {{ expenseCount }} {{ expenseCount === 1 ? 'movimiento' : 'movimientos' }}
              </span>
            </div>
            <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/30">
              <ArrowUpCircle class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <!-- Saldo Final -->
        <div class="bg-page-card rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-page-subtitle text-sm font-medium mb-2">Saldo al cierre del período</p>
              <p class="text-page-title text-3xl font-bold mb-1">
                {{ formatCurrencyFull(saldoFinal) }}
              </p>
              <span class="text-sm text-primary-700 dark:text-primary-300 font-semibold">En caja ahora</span>
            </div>
            <div class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30">
              <Wallet class="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <BaseButton
          variant="primary"
          size="lg"
          @click="openModal"
          class="flex items-center justify-center gap-2"
        >
          <Plus class="w-5 h-5" />
          Registrar Movimiento
        </BaseButton>

        <BaseButton
          variant="secondary"
          size="lg"
          @click="handleExportExcel"
          :disabled="exportingExcel"
          class="flex items-center justify-center gap-2"
        >
          <FileSpreadsheet class="w-5 h-5" />
          {{ exportingExcel ? 'Generando...' : 'Exportar Excel' }}
        </BaseButton>
      </div>

      <!-- Tabla de Movimientos -->
      <div class="bg-page-card rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-page-border flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <h2 class="text-lg font-semibold text-page-title">
            Movimientos del Período ({{ transactions.length }})
          </h2>
          <div class="w-full xl:w-56">
            <BaseSelect
              v-model="pageSize"
              id="cash-page-size"
              label="Filas por página"
              :options="pageSizeOptions"
              value-key="value"
              label-key="label"
              placeholder="Seleccionar cantidad"
              size="md"
              :disabled="pageSizeOptions.length === 0"
              @change="handlePageSizeChange"
            />
          </div>
        </div>

        <div v-if="loading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">Cargando movimientos...</p>
        </div>

        <div v-else-if="transactions.length === 0" class="p-12 text-center">
          <FileText class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">No hay movimientos registrados en este período</p>
        </div>

        <div v-else>
          <div class="divide-y divide-page-border xl:hidden">
            <article
              v-for="transaction in paginatedTransactions"
              :key="`mobile-${transaction.id}`"
              class="space-y-3 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-semibold text-page-title">{{ transaction.categoria }}</p>
                  <p v-if="transaction.descripcion" class="mt-1 text-sm text-page-subtitle">{{ transaction.descripcion }}</p>
                </div>
                <p class="whitespace-nowrap text-right text-base font-bold" :class="transaction.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'">
                  {{ transaction.tipo === 'INGRESO' ? '+' : '-' }}{{ formatCurrencyFull(transaction.monto) }}
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-sm text-page-subtitle">
                <span>{{ formatTime(transaction.created_at) }}</span>
                <span aria-hidden="true">·</span>
                <span :class="transaction.tipo === 'INGRESO' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'">
                  {{ transaction.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso' }}
                </span>
                <span v-if="transaction.payment_id" class="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">Cuota</span>
                <span class="ml-auto text-xs text-page-muted">{{ transaction.payment_id ? 'Sistema' : 'Operador' }}</span>
              </div>
            </article>
          </div>

          <div class="hidden overflow-x-auto xl:block">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-white/5">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hora
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Concepto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody class="bg-page-card divide-y divide-gray-200 dark:divide-gray-700/50">
              <tr v-for="transaction in paginatedTransactions" :key="transaction.id" class="hover:bg-gray-50 dark:hover:bg-white/5">
                <!-- Hora -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-page-title">
                  {{ formatTime(transaction.created_at) }}
                </td>

                <!-- Concepto -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div>
                      <p class="text-sm font-medium text-page-title">{{ transaction.categoria }}</p>
                      <p v-if="transaction.descripcion" class="text-sm text-gray-500 dark:text-gray-400">
                        {{ transaction.descripcion }}
                      </p>
                    </div>
                    <!-- Badge si está vinculado a un pago -->
                    <span
                      v-if="transaction.payment_id"
                      class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                    >
                      <CreditCard class="w-3 h-3" />
                      Cuota
                    </span>
                  </div>
                </td>

                <!-- Tipo -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="transaction.tipo === 'INGRESO'"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                  >
                    <ArrowDownCircle class="w-4 h-4" />
                    Ingreso
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  >
                    <ArrowUpCircle class="w-4 h-4" />
                    Egreso
                  </span>
                </td>

                <!-- Monto -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold"
                    :class="transaction.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'"
                >
                  {{ transaction.tipo === 'INGRESO' ? '+' : '-' }}{{ formatCurrencyFull(transaction.monto) }}
                </td>

                <!-- Usuario -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded" :title="transaction.payment_id ? 'Movimiento generado por un pago' : 'Movimiento registrado por un operador'">
                    {{ transaction.payment_id ? 'Sistema' : 'Operador' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <div v-if="transactions.length > 0" class="px-6 py-4 border-t border-page-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
            Mostrando {{ visibleFrom }}-{{ visibleTo }} de {{ totalTransactions }} movimiento(s)
          </p>

          <div class="flex items-center justify-center gap-2">
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="currentPage === 1"
              @click="goToPreviousPage"
            >
              <ChevronLeft class="w-4 h-4 mr-1" />
              Anterior
            </BaseButton>

            <span class="text-sm font-medium text-gray-600 dark:text-gray-300 min-w-28 text-center">
              Pagina {{ currentPage }} de {{ totalPages }}
            </span>

            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="currentPage >= totalPages"
              @click="goToNextPage"
            >
              Siguiente
              <ChevronRight class="w-4 h-4 ml-1" />
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Transacción -->
    <TransactionModal
      v-if="showModal"
      @close="closeModal"
      @submit="handleSubmit"
    />

    <!-- Modal de Éxito -->
    <BaseModal
      v-if="showSuccessModal"
      :model-value="showSuccessModal"
      title="Movimiento registrado"
      size="sm"
      @close="showSuccessModal = false"
    >
      <div class="py-2 text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle class="h-6 w-6 text-emerald-600" aria-hidden="true" />
        </div>
        <p class="text-page-subtitle">El movimiento se ha guardado correctamente.</p>
      </div>

      <template #footer>
        <BaseButton variant="primary" full-width @click="showSuccessModal = false">
          Aceptar
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useCashRegister } from '@/composables/useCashRegister'
import { useParameters } from '@/composables/useParameters'
import { useAppResume } from '@/composables/useAppResume'
import { formatCurrencyFull } from '@/utils/formatters'
import { reportClientError } from '@/lib/observability'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import TransactionModal from './TransactionModal.vue'
import {
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Plus,
  FileSpreadsheet,
  FileText,
  CreditCard,
  CheckCircle
} from 'lucide-vue-next'

const {
  transactions,
  balanceAnterior,
  ingresosDia,
  egresosDia,
  saldoFinal,
  loading,
  loadRangeData,
  addManualTransaction,
  exportToExcel
} = useCashRegister()
const { memberPageSizes, fetchMemberPageSizes } = useParameters()

// Estado local - Inicializar con primer día del mes hasta hoy
const initializeDefaultDates = () => {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  return {
    start: firstDayOfMonth.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0]
  }
}

const defaultDates = initializeDefaultDates()
const startDate = ref(defaultDates.start)
const endDate = ref(defaultDates.end)
const showModal = ref(false)
const showSuccessModal = ref(false)
const exportingExcel = ref(false)
const pageSize = ref(10)
const currentPage = ref(1)

const pageSizeOptions = computed(() => {
  return memberPageSizes.value.map(option => ({
    value: Number(option.value),
    label: option.label
  }))
})

const resolvedPageSize = computed(() => Number(pageSize.value) || 10)

const totalTransactions = computed(() => transactions.value.length)
const incomeCount = computed(() => transactions.value.filter(t => t.tipo === 'INGRESO').length)
const expenseCount = computed(() => transactions.value.filter(t => t.tipo === 'EGRESO').length)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalTransactions.value / resolvedPageSize.value))
})

const paginatedTransactions = computed(() => {
  const startIndex = (currentPage.value - 1) * resolvedPageSize.value
  return transactions.value.slice(startIndex, startIndex + resolvedPageSize.value)
})

const visibleFrom = computed(() => {
  if (totalTransactions.value === 0) return 0
  return (currentPage.value - 1) * resolvedPageSize.value + 1
})

const visibleTo = computed(() => {
  if (totalTransactions.value === 0) return 0
  return Math.min(currentPage.value * resolvedPageSize.value, totalTransactions.value)
})

// Watcher: Si startDate > endDate, actualizar endDate automáticamente
watch(startDate, (newStart) => {
  if (newStart > endDate.value) {
    endDate.value = newStart
  }
})

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages
  }
})

watch(memberPageSizes, (options) => {
  if (!options.length) return

  const hasCurrentValue = options.some(option => Number(option.value) === Number(pageSize.value))

  if (!hasCurrentValue) {
    pageSize.value = Number(options[0].value)
  }
}, { immediate: true })

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Métodos
const reloadCurrentRange = async () => {
  const start = new Date(startDate.value + 'T12:00:00')
  const end = new Date(endDate.value + 'T12:00:00')
  await loadRangeData(start, end)
}

const handleFilterClick = async () => {
  currentPage.value = 1
  await reloadCurrentRange()
}

const handlePageSizeChange = (value) => {
  const numericValue = Number(value)
  if (!numericValue) return
  pageSize.value = numericValue
  currentPage.value = 1
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async (formData) => {
  const result = await addManualTransaction(formData)
  
  if (result.success) {
    closeModal()
    showSuccessModal.value = true
    // Recargar con el rango actual
    await handleFilterClick()
  } else {
    toast.error(`Error al registrar el movimiento: ${result.error}`, { duration: 5000 })
  }
}

const handleExportExcel = async () => {
  // Validar que hay datos
  if (transactions.value.length === 0) {
    toast.warning('No hay movimientos para exportar en este período', { duration: 3000 })
    return
  }

  exportingExcel.value = true
  
  try {
    const start = new Date(startDate.value + 'T12:00:00')
    const end = new Date(endDate.value + 'T12:00:00')
    
    const exportPromise = exportToExcel(start, end)
    
    await toast.promise(exportPromise, {
      loading: 'Generando archivo Excel...',
      success: 'Reporte exportado exitosamente',
      error: (err) => `Error al exportar: ${err.message || 'Error desconocido'}`
    })
  } catch (err) {
    reportClientError('cash.export', err)
  } finally {
    exportingExcel.value = false
  }
}

// Inicialización
onMounted(async () => {
  await Promise.all([
    reloadCurrentRange(),
    fetchMemberPageSizes()
  ])
})

useAppResume(async () => {
  await Promise.all([
    reloadCurrentRange(),
    fetchMemberPageSizes()
  ])
}, { minIntervalMs: 1500 })
</script>

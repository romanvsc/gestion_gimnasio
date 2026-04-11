<template>
  <div class="bg-page-card rounded-xl shadow-sm border border-page-border p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-page-title flex items-center gap-2">
        <History class="w-5 h-5" />
        Historial de Pagos
      </h2>
      <BaseButton
        color="primary"
        size="sm"
        @click="$emit('new-payment')"
      >
        + Registrar Pago
      </BaseButton>
    </div>

    <!-- Loading de pagos -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600 dark:text-gray-400">Cargando historial...</p>
    </div>

    <!-- Sin pagos -->
    <div v-else-if="payments.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
      <History class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
      <p class="text-lg font-medium">No hay pagos registrados</p>
      <p class="text-sm">Registra el primer pago para este socio</p>
    </div>

    <!-- Tabla de Pagos -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-white/5">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Fecha Pago
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Plan
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Periodo
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Monto
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Método
            </th>
          </tr>
        </thead>
        <tbody class="bg-page-card divide-y divide-gray-200 dark:divide-gray-700/50">
          <tr 
            v-for="payment in payments" 
            :key="payment.id"
            :class="[
              'hover:bg-gray-50 dark:hover:bg-white/5 transition-colors',
              isPaymentExpired(payment.fecha_fin) && 'opacity-60'
            ]"
          >
            <td class="px-4 py-4 whitespace-nowrap text-sm text-page-title">
              {{ formatDateLong(payment.created_at) }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-page-title">
              {{ payment.plans?.nombre || 'Plan' }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              {{ formatDateLong(payment.fecha_inicio) }} - {{ formatDateLong(payment.fecha_fin) }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <span class="text-sm font-semibold text-emerald-600">
                ${{ formatCurrency(payment.monto) }}
              </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-page-title">
              {{ payment.metodo_pago }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Total de Pagos -->
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Total de pagos: <span class="font-semibold">{{ payments.length }}</span>
        </span>
        <span class="text-lg font-bold text-page-title">
          Total recaudado: <span class="text-emerald-600">${{ formatCurrency(totalAmount) }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { History } from 'lucide-vue-next'
import { formatDateLong, formatCurrency } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  payments: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['new-payment'])

const totalAmount = computed(() => {
  return props.payments.reduce((sum, payment) => sum + parseFloat(payment.monto || 0), 0)
})

function isPaymentExpired(fechaFin) {
  if (!fechaFin) return false
  const today = new Date()
  const endDate = new Date(fechaFin + 'T00:00:00')
  return endDate < today
}
</script>

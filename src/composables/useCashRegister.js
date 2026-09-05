import { ref, computed } from 'vue'
import { billingCash, calculateCashSummary } from '@/contexts/billing-cash'
import { formatCurrencyFull } from '@/utils/formatters'
import { downloadExcelWorkbook } from '@/utils/excelExport'
import { reportClientError } from '@/lib/observability'

export function useCashRegister() {
  const transactions = ref([])
  const balanceAnterior = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // Computed: Totales del día
  const cashSummary = computed(() => calculateCashSummary({
    balanceAnterior: balanceAnterior.value,
    transactions: transactions.value
  }))

  const ingresosDia = computed(() => cashSummary.value.ingresos)
  const egresosDia = computed(() => cashSummary.value.egresos)
  const saldoFinal = computed(() => cashSummary.value.saldoFinal)

  /**
   * Carga los movimientos por rango de fechas y el saldo anterior
   * @param {Date} startDate - Fecha de inicio del rango
   * @param {Date} endDate - Fecha de fin del rango
   */
  async function loadRangeData(startDate, endDate) {
    try {
      loading.value = true
      error.value = null

      // Convertir fechas a formato ISO (solo fecha, sin hora)
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      const rangeData = await billingCash.loadCashRange({
        startDate: startDateStr,
        endDate: endDateStr
      })

      balanceAnterior.value = rangeData.balanceAnterior
      transactions.value = rangeData.transactions

      return { success: true }
    } catch (err) {
      reportClientError('cash.range_fetch', err)
      error.value = err.message
      
      // Resetear valores en caso de error
      transactions.value = []
      balanceAnterior.value = 0
      
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra una transacción manual
   * @param {Object} form - { tipo, categoria, descripcion, monto }
   */
  async function addManualTransaction(form) {
    try {
      loading.value = true
      error.value = null

      const data = await billingCash.registerManualTransaction(form)

      // Recargar datos del día actual
      const today = new Date()
      await loadRangeData(today, today)

      return { success: true, data }
    } catch (err) {
      reportClientError('cash.transaction_create', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      // CRÍTICO: Siempre liberar el loading
      loading.value = false
    }
  }

  /**
   * Genera reporte en texto plano para copiar
   */
  function generateReport(startDate, endDate) {
    const formatDate = (date) => {
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit'
      })
    }

    const startDateFormatted = formatDate(startDate)
    const endDateFormatted = formatDate(endDate)

    let report = `📅 REPORTE FINANCIERO: ${startDateFormatted} al ${endDateFormatted}\n`
    report += `${'='.repeat(50)}\n\n`
    report += `💰 Saldo Inicial del Período: ${formatCurrencyFull(balanceAnterior.value)}\n`
    report += `📈 Ingresos del período: ${formatCurrencyFull(ingresosDia.value)}\n`
    report += `📉 Egresos del período: ${formatCurrencyFull(egresosDia.value)}\n`
    report += `${'-'.repeat(50)}\n`
    report += `💵 SALDO FINAL: ${formatCurrencyFull(saldoFinal.value)}\n\n`

    // Detalle de movimientos
    if (transactions.value.length > 0) {
      report += `DETALLE DE MOVIMIENTOS:\n`
      report += `${'-'.repeat(50)}\n\n`

      transactions.value.forEach((t) => {
        const time = new Date(t.created_at).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        const tipo = t.tipo === 'INGRESO' ? '✅' : '❌'
        const monto = formatCurrencyFull(t.monto)
        
        report += `${time} | ${tipo} ${t.categoria}\n`
        if (t.descripcion) {
          report += `   └─ ${t.descripcion}\n`
        }
        report += `   └─ Monto: ${monto}\n\n`
      })
    }

    return report
  }

  /**
   * Exporta los datos del período a un archivo Excel
   */
  async function exportToExcel(startDate, endDate) {
    try {
      // Validar que hay datos
      if (transactions.value.length === 0) {
        throw new Error('No hay movimientos para exportar en este período')
      }


      // Formatear fechas para el nombre del archivo
      const formatDateForFile = (date) => {
        return date.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '-')
      }

      const startFormatted = formatDateForFile(startDate)
      const endFormatted = formatDateForFile(endDate)

      // Crear hoja de Resumen
      const resumenData = [
        ['REPORTE DE CAJA'],
        ['Período', `${startFormatted} al ${endFormatted}`],
        [],
        ['Concepto', 'Valor'],
        ['Saldo Inicial del Período', balanceAnterior.value],
        ['Ingresos del Período', ingresosDia.value],
        ['Egresos del Período', egresosDia.value],
        ['Saldo Final', saldoFinal.value]
      ]

      // Crear hoja de Movimientos
      const movimientosData = transactions.value.map(t => {
        const fecha = new Date(t.created_at)
        return {
          'Fecha y Hora': fecha.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          'Tipo': t.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso',
          'Categoría': t.categoria || '-',
          'Descripción': t.descripcion || '-',
          'Monto': t.tipo === 'INGRESO' ? parseFloat(t.monto) : -parseFloat(t.monto),
          'Usuario': t.payment_id ? 'Sistema' : 'Operador'
        }
      })

      // Generar y descargar archivo
      const fileName = `Caja_Gym_${startFormatted}_al_${endFormatted}.xlsx`
      await downloadExcelWorkbook([
        { name: 'Resumen', data: resumenData, widths: [32, 24] },
        {
          name: 'Movimientos',
          data: [
            ['Fecha y Hora', 'Tipo', 'CategorÃ­a', 'DescripciÃ³n', 'Monto', 'Usuario'],
            ...movimientosData.map((movement) => Object.values(movement))
          ],
          widths: [22, 12, 20, 36, 16, 14]
        }
      ], fileName)

      return { success: true }
    } catch (err) {
      reportClientError('cash.export_excel', err)
      return { success: false, error: err.message }
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // Estado
    transactions,
    balanceAnterior,
    ingresosDia,
    egresosDia,
    saldoFinal,
    loading,
    error,
    // Métodos
    loadRangeData,
    addManualTransaction,
    generateReport,
    exportToExcel,
    clearError
  }
}

import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export function useCashRegister() {
  const transactions = ref([])
  const balanceAnterior = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // Computed: Totales del día
  const ingresosDia = computed(() => {
    return transactions.value
      .filter(t => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0)
  })

  const egresosDia = computed(() => {
    return transactions.value
      .filter(t => t.tipo === 'EGRESO')
      .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0)
  })

  const saldoFinal = computed(() => {
    return balanceAnterior.value + ingresosDia.value - egresosDia.value
  })

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

      // Consulta 1: Saldo Anterior (al inicio del rango)
      const { data: balanceData, error: balanceError } = await supabase
        .rpc('get_previous_balance', { check_date: startDateStr })

      if (balanceError) throw balanceError

      balanceAnterior.value = balanceData || 0

      // Consulta 2: Movimientos del rango
      const startDateTime = `${startDateStr}T00:00:00`
      const endDateTime = `${endDateStr}T23:59:59`

      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDateTime)
        .lte('created_at', endDateTime)
        .order('created_at', { ascending: false })

      if (transError) throw transError

      transactions.value = transData || []

      return { success: true }
    } catch (err) {
      console.error('Error cargando datos de caja:', err)
      error.value = err.message
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

      // Obtener usuario actual (created_by)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Usuario no autenticado')

      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert({
          tipo: form.tipo,
          categoria: form.categoria,
          descripcion: form.descripcion || null,
          monto: parseFloat(form.monto),
          created_by: user.id,
          payment_id: null
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Recargar datos del día actual
      const today = new Date()
      await loadRangeData(today, today)

      return { success: true, data }
    } catch (err) {
      console.error('Error registrando transacción:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
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

    const formatMoney = (amount) => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount)
    }

    const startDateFormatted = formatDate(startDate)
    const endDateFormatted = formatDate(endDate)

    let report = `📅 REPORTE FINANCIERO: ${startDateFormatted} al ${endDateFormatted}\n`
    report += `${'='.repeat(50)}\n\n`
    report += `💰 Saldo Inicial del Período: ${formatMoney(balanceAnterior.value)}\n`
    report += `📈 Ingresos del período: ${formatMoney(ingresosDia.value)}\n`
    report += `📉 Egresos del período: ${formatMoney(egresosDia.value)}\n`
    report += `${'-'.repeat(50)}\n`
    report += `💵 SALDO FINAL: ${formatMoney(saldoFinal.value)}\n\n`

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
        const monto = formatMoney(t.monto)
        
        report += `${time} | ${tipo} ${t.categoria}\n`
        if (t.descripcion) {
          report += `   └─ ${t.descripcion}\n`
        }
        report += `   └─ Monto: ${monto}\n\n`
      })
    }

    return report
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
    clearError
  }
}

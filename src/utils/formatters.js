export function formatCurrency(value) {
  return value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function formatTime(timestamp) {
  if (!timestamp) return '-'
  const fecha = new Date(timestamp)
  const hoy = new Date()
  const esHoy = fecha.toDateString() === hoy.toDateString()
  
  const hora = fecha.toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  
  if (esHoy) return hora
  
  return fecha.toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: '2-digit' 
  }) + ' ' + hora
}

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

function timeToMinutes(value) {
  const [hours, minutes] = String(value).slice(0, 5).split(':').map(Number)
  return hours * 60 + minutes
}

export function normalizeWorkMonth(value) {
  const normalized = String(value ?? '').trim()

  if (!MONTH_PATTERN.test(normalized)) {
    throw new Error('El mes debe tener formato YYYY-MM')
  }

  return normalized
}

export function getWorkMonthRange(month) {
  const normalized = normalizeWorkMonth(month)
  const [year, monthNumber] = normalized.split('-').map(Number)
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()

  return {
    month: normalized,
    startDate: `${normalized}-01`,
    endDate: `${normalized}-${String(lastDay).padStart(2, '0')}`
  }
}

export function summarizeWorkShifts(shifts = []) {
  const totalMinutes = shifts.reduce((total, shift) => total + Number(shift.duration_minutes || 0), 0)

  return {
    totalMinutes,
    totalHours: totalMinutes / 60
  }
}

/**
 * Protege la regla de que los intervalos de una persona no se superpongan.
 * Los extremos son abiertos: 08:00-12:00 y 12:00-14:00 son contiguos y válidos.
 */
export function validateWorkShiftOverlaps(shifts = [], { ignoreId = null } = {}) {
  const groupedShifts = new Map()

  for (const shift of shifts) {
    if (shift?.id === ignoreId) continue

    const groupKey = `${shift.staff_id}:${shift.work_date}`
    const group = groupedShifts.get(groupKey) || []
    group.push({
      ...shift,
      startMinutes: timeToMinutes(shift.start_time),
      endMinutes: timeToMinutes(shift.end_time)
    })
    groupedShifts.set(groupKey, group)
  }

  for (const group of groupedShifts.values()) {
    const orderedShifts = group.sort((first, second) => first.startMinutes - second.startMinutes)

    for (let index = 1; index < orderedShifts.length; index += 1) {
      const previous = orderedShifts[index - 1]
      const current = orderedShifts[index]

      if (current.startMinutes < previous.endMinutes) {
        throw new Error('Los intervalos de una misma persona y fecha no pueden superponerse')
      }
    }
  }

  return true
}

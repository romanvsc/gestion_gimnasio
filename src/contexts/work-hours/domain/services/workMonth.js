const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

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

<template>
  <section class="overflow-hidden rounded-2xl border border-page-border bg-page-card" aria-labelledby="work-calendar-title">
    <div class="flex items-center justify-between border-b border-page-border px-3 py-3 sm:px-5">
      <div>
        <h2 id="work-calendar-title" class="text-base font-semibold text-page-title sm:text-lg">Calendario mensual</h2>
        <p class="text-xs text-page-subtitle sm:text-sm">Seleccioná un día para cargar o editar la jornada.</p>
      </div>
      <span class="hidden rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 sm:inline-flex">
        {{ monthLabel }}
      </span>
    </div>

    <div class="grid grid-cols-7 border-b border-page-border bg-page-bg/70 dark:bg-white/[0.03]">
      <div
        v-for="dayName in weekDays"
        :key="dayName"
        class="px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-page-subtitle sm:px-2 sm:text-xs"
      >
        {{ dayName }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-px bg-page-border p-px" role="grid" :aria-label="`Calendario de ${monthLabel}`">
      <button
        v-for="day in calendarDays"
        :key="day.date"
        type="button"
        role="gridcell"
        :disabled="!day.isCurrentMonth || day.isFuture || !canEdit"
        :aria-label="getDayAriaLabel(day)"
        :class="[
          'group relative flex min-h-[7.5rem] min-w-0 flex-col bg-page-card p-1.5 text-left transition-colors sm:min-h-[8.75rem] sm:p-2',
          day.isCurrentMonth ? 'text-page-title' : 'text-page-muted opacity-60',
          day.isFuture || !canEdit ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-page-card-hover',
          day.isToday ? 'ring-2 ring-inset ring-primary-500' : '',
          day.shift ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''
        ]"
        @click="$emit('select-day', day)"
      >
        <span
          :class="[
            'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 sm:text-sm',
            day.isToday ? 'bg-primary-600 text-white' : '',
            day.isWeekend && day.isCurrentMonth && !day.isToday ? 'text-danger-600 dark:text-danger-400' : ''
          ]"
        >
          {{ day.dayNumber }}
        </span>

        <div v-if="day.shift" class="min-w-0 space-y-1">
          <span class="block truncate text-[10px] font-semibold text-page-title sm:text-xs">
            {{ day.shift.start_time }} – {{ day.shift.end_time }}
          </span>
          <span class="inline-flex max-w-full items-center rounded-md bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200 sm:text-xs">
            {{ day.shift.duration_label }}
          </span>
          <span class="block text-[10px] text-page-muted">{{ day.isToday ? 'Hoy' : 'Jornada cargada' }}</span>
        </div>

        <span
          v-else-if="day.isCurrentMonth && !day.isFuture && canEdit"
          class="mt-auto inline-flex items-center gap-1 text-[10px] font-semibold text-primary-600 opacity-80 transition-opacity group-hover:opacity-100 dark:text-primary-400 sm:text-xs"
        >
          <Plus class="h-3 w-3" aria-hidden="true" />
          Cargar
        </span>
        <span v-else-if="day.isFuture && day.isCurrentMonth" class="mt-auto text-[10px] text-page-muted sm:text-xs">
          Próximamente
        </span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Plus } from 'lucide-vue-next'

const props = defineProps({
  month: { type: String, required: true },
  shifts: { type: Array, default: () => [] },
  today: { type: String, required: true },
  canEdit: { type: Boolean, default: true }
})

defineEmits(['select-day'])

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const dayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

const monthLabel = computed(() => {
  const [year, month] = props.month.split('-').map(Number)
  const label = monthFormatter.format(new Date(Date.UTC(year, month - 1, 1)))
  return label.charAt(0).toUpperCase() + label.slice(1)
})

const shiftByDate = computed(() => new Map(props.shifts.map(shift => [shift.work_date, shift])))

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

const calendarDays = computed(() => {
  const [year, monthNumber] = props.month.split('-').map(Number)
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1))
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const mondayBasedOffset = (firstDay.getUTCDay() + 6) % 7
  const totalCells = Math.ceil((mondayBasedOffset + daysInMonth) / 7) * 7

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(Date.UTC(year, monthNumber - 1, 1 - mondayBasedOffset + index))
    const key = dateKey(date)

    return {
      date: key,
      dayNumber: date.getUTCDate(),
      isCurrentMonth: date.getUTCMonth() === monthNumber - 1,
      isToday: key === props.today,
      isFuture: key > props.today,
      isWeekend: date.getUTCDay() === 0 || date.getUTCDay() === 6,
      shift: shiftByDate.value.get(key) || null
    }
  })
})

function getDayAriaLabel(day) {
  const dateLabel = dayFormatter.format(new Date(`${day.date}T00:00:00Z`))
  if (day.shift) return `${dateLabel}: jornada de ${day.shift.start_time} a ${day.shift.end_time}, ${day.shift.duration_label}`
  if (day.isFuture) return `${dateLabel}: fecha futura`
  return `${dateLabel}: sin jornada cargada`
}
</script>

<template>
  <div class="min-h-screen bg-page-bg pb-24 transition-colors duration-200 md:pb-8">
    <div class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:py-8 xl:px-8">
      <header class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <CalendarDays class="h-4 w-4" aria-hidden="true" />
            Registro de jornadas
          </div>
          <h1 class="text-2xl font-bold text-page-title md:text-3xl">Banco de horas</h1>
          <p class="mt-1 max-w-2xl text-page-subtitle">Anotá tus horas trabajadas y consultá el total de cada mes.</p>
        </div>

        <div v-if="isAdmin" class="w-full lg:max-w-xs">
          <BaseSelect
            id="work-hours-active-staff"
            v-model="activeStaffId"
            label="Recepcionista activa"
            placeholder="Seleccionar recepcionista"
            :options="activeReceptionistOptions"
            @change="historicalStaffId = ''"
          />
        </div>
      </header>

      <div v-if="isAdmin && inactiveReceptionists.length" class="mb-6 rounded-2xl border border-warning-200 bg-warning-50/60 p-4 dark:border-warning-800 dark:bg-warning-900/20">
        <div class="mb-3 flex items-start gap-3">
          <Archive class="mt-0.5 h-5 w-5 flex-shrink-0 text-warning-700 dark:text-warning-300" aria-hidden="true" />
          <div>
            <h2 class="font-semibold text-warning-900 dark:text-warning-100">Historial de personal inactivo</h2>
            <p class="text-sm text-warning-800 dark:text-warning-200">Podés consultar y corregir sus jornadas anteriores.</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="staff in inactiveReceptionists"
            :key="staff.id"
            type="button"
            :class="[
              'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              historicalStaffId === staff.id
                ? 'border-warning-500 bg-warning-100 text-warning-900 dark:bg-warning-900/50 dark:text-warning-100'
                : 'border-warning-200 bg-page-card text-warning-800 hover:bg-warning-100 dark:border-warning-700 dark:text-warning-200 dark:hover:bg-warning-900/40'
            ]"
            @click="selectHistoricalStaff(staff.id)"
          >
            {{ staff.usuario || staff.email }}
          </button>
        </div>
      </div>

      <div v-if="error" class="mb-6 flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 p-4 text-danger-800 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200" role="alert">
        <AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <div>
          <p class="font-semibold">No se pudo cargar el banco de horas</p>
          <p class="mt-1 text-sm">{{ error }}</p>
        </div>
      </div>

      <div v-if="selectedStaffId" class="space-y-6">
        <section class="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Resumen del mes">
          <div class="rounded-2xl border border-page-border bg-page-card p-4 shadow-sm sm:col-span-2">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm text-page-subtitle">Persona seleccionada</p>
                <p class="mt-1 text-lg font-bold text-page-title">{{ selectedStaffName }}</p>
              </div>
              <UserRound class="h-8 w-8 text-primary-500" aria-hidden="true" />
            </div>
          </div>
          <div class="rounded-2xl border border-primary-200 bg-primary-50 p-4 shadow-sm dark:border-primary-800 dark:bg-primary-900/20">
            <p class="text-sm text-primary-700 dark:text-primary-300">Total de {{ monthLabel }}</p>
            <p class="mt-1 text-2xl font-bold text-primary-900 dark:text-primary-100">{{ formattedTotal }}</p>
          </div>
        </section>

        <section class="rounded-2xl border border-page-border bg-page-card p-3 shadow-sm sm:p-5">
          <div class="mb-4 flex items-center justify-between gap-3">
            <BaseButton type="button" variant="secondary" size="sm" aria-label="Mes anterior" @click="goToPreviousMonth">
              <ChevronLeft class="h-4 w-4" aria-hidden="true" />
              <span class="hidden sm:inline">Anterior</span>
            </BaseButton>
            <h2 class="text-center text-lg font-bold capitalize text-page-title sm:text-xl">{{ monthLabel }}</h2>
            <BaseButton type="button" variant="secondary" size="sm" aria-label="Mes siguiente" :disabled="isCurrentMonth" @click="goToNextMonth">
              <span class="hidden sm:inline">Siguiente</span>
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </BaseButton>
          </div>

          <div v-if="loading" class="flex min-h-72 items-center justify-center text-page-subtitle" role="status" aria-live="polite">
            <Loader2 class="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            Cargando jornadas...
          </div>
          <WorkHoursCalendar
            v-else
            :month="currentMonth"
            :shifts="shifts"
            :today="businessToday"
            :can-edit="canEdit"
            @select-day="openDay"
          />
        </section>
      </div>

      <div v-else class="rounded-2xl border border-dashed border-page-border bg-page-card p-10 text-center">
        <UsersRound class="mx-auto h-10 w-10 text-page-muted" aria-hidden="true" />
        <h2 class="mt-4 text-lg font-semibold text-page-title">Seleccioná una recepcionista</h2>
        <p class="mt-1 text-sm text-page-subtitle">Elegí una persona activa o consultá un historial inactivo para ver sus jornadas.</p>
      </div>
    </div>

    <WorkShiftModal
      v-if="showShiftModal"
      v-model="showShiftModal"
      :date="selectedDate"
      :shift="selectedShift"
      :staff-name="selectedStaffName"
      :saving="saving"
      @save="handleSaveShift"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { AlertCircle, Archive, CalendarDays, ChevronLeft, ChevronRight, Loader2, UserRound, UsersRound } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import WorkHoursCalendar from '@/components/work-hours/WorkHoursCalendar.vue'
import WorkShiftModal from '@/components/work-hours/WorkShiftModal.vue'
import { formatWorkDuration, summarizeWorkShifts, workHours } from '@/contexts/work-hours'
import { useWorkHours } from '@/composables/useWorkHours'
import { useAppResume } from '@/composables/useAppResume'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.userRole === 'admin')
const canEdit = computed(() => ['admin', 'recepcion'].includes(userStore.userRole))
const businessToday = ref(workHours.today())
const currentMonth = ref(businessToday.value.slice(0, 7))
const activeStaffId = ref('')
const historicalStaffId = ref('')
const selectedDate = ref('')
const showShiftModal = ref(false)

const { shifts, receptionists, loading, saving, error, loadMonth, loadReceptionists, saveShift } = useWorkHours()

const activeReceptionists = computed(() => receptionists.value.filter(staff => staff.activo))
const inactiveReceptionists = computed(() => receptionists.value.filter(staff => !staff.activo))
const activeReceptionistOptions = computed(() => activeReceptionists.value.map(staff => ({
  value: staff.id,
  label: staff.usuario || staff.email
})))
const selectedStaffId = computed(() => isAdmin.value
  ? (historicalStaffId.value || activeStaffId.value)
  : userStore.user?.id || '')
const selectedStaff = computed(() => receptionists.value.find(staff => staff.id === selectedStaffId.value) || null)
const selectedStaffName = computed(() => selectedStaff.value?.usuario || selectedStaff.value?.email || 'Mi banco de horas')
const isCurrentMonth = computed(() => currentMonth.value === businessToday.value.slice(0, 7))
const selectedShift = computed(() => shifts.value.find(shift => shift.work_date === selectedDate.value) || null)
const monthLabel = computed(() => {
  const [year, month] = currentMonth.value.split('-').map(Number)
  const label = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, 1)))
  return label.charAt(0).toUpperCase() + label.slice(1)
})
const formattedTotal = computed(() => formatWorkDuration(summarizeWorkShifts(shifts.value).totalMinutes))

function shiftMonth(month, amount) {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, monthNumber - 1 + amount, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function goToPreviousMonth() {
  currentMonth.value = shiftMonth(currentMonth.value, -1)
}

function goToNextMonth() {
  if (!isCurrentMonth.value) currentMonth.value = shiftMonth(currentMonth.value, 1)
}

function selectHistoricalStaff(staffId) {
  historicalStaffId.value = staffId
  activeStaffId.value = ''
}

function openDay(day) {
  if (!day.isCurrentMonth || day.isFuture || !canEdit.value || !selectedStaffId.value) return
  selectedDate.value = day.date
  showShiftModal.value = true
}

async function reloadMonth() {
  await loadMonth(selectedStaffId.value, currentMonth.value)
}

async function handleSaveShift({ id, start_time, end_time }) {
  const result = await saveShift({ id, staff_id: selectedStaffId.value, work_date: selectedDate.value, start_time, end_time })

  if (!result.success) {
    toast.error(result.error, { duration: 5000 })
    return
  }

  showShiftModal.value = false
  await reloadMonth()
  toast.success(id ? 'Jornada actualizada correctamente' : 'Jornada guardada correctamente', { duration: 2500 })
}

watch(selectedStaffId, reloadMonth)
watch(currentMonth, reloadMonth)

onMounted(async () => {
  businessToday.value = workHours.today()

  if (isAdmin.value) {
    const result = await loadReceptionists()
    if (result.success && activeReceptionists.value.length > 0) activeStaffId.value = activeReceptionists.value[0].id
  }

  await reloadMonth()
})

useAppResume(async () => {
  businessToday.value = workHours.today()
  if (isCurrentMonth.value && selectedStaffId.value) await reloadMonth()
}, { minIntervalMs: 1500 })
</script>

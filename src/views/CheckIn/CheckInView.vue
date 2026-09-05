<template>
  <div class="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-200 dark:from-page-bg dark:to-page-card">
    <div v-if="isKioskMode" class="absolute right-4 top-4 z-20">
      <BaseButton
        variant="secondary"
        size="sm"
        aria-label="Salir del modo kiosco"
        @click="exitKioskMode"
      >
        Salir del kiosco
      </BaseButton>
    </div>
    <div class="min-h-[100dvh] flex flex-col xl:flex-row">
      
      <!-- Área Principal: Kiosco de Acceso -->
      <div class="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        
        <!-- Icono Decorativo + Header -->
        <div class="mb-8 text-center">
          <div class="mb-6 flex justify-center">
            <CreditCard class="h-12 w-12 text-gray-200 dark:text-gray-700 md:h-16 md:w-16" aria-hidden="true" />
          </div>
          <h1 class="mb-2 text-2xl font-bold text-page-title md:text-4xl">Acceso al Gimnasio</h1>
          <p class="text-base text-page-subtitle md:text-lg">Escanea o ingresa tu DNI</p>
        </div>

        <!-- Buscador Gigante Centrado -->
        <div class="w-full max-w-2xl mb-5">
          <BaseInput
            v-model="searchQuery"
            id="checkin-search"
            label="Buscar socio"
            size="kiosk"
            placeholder="Ingresa DNI, nombre o apellido..."
            :autofocus="true"
            @input="searchMembers"
          />
        </div>

        <!-- Fecha de asistencia -->
        <div class="w-full max-w-2xl mb-8">
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-page-card p-4 shadow-sm">
            <div class="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div class="flex-1">
                <BaseInput
                  v-model="selectedAttendanceDate"
                  id="attendance-date"
                  label="Fecha de asistencia"
                  type="date"
                  size="lg"
                />
              </div>
              <BaseButton
                label="Hoy"
                variant="secondary"
                size="md"
                @click="setTodayDate"
              />
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center" role="status" aria-live="polite">
          <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p class="text-gray-600 dark:text-gray-400 mt-4 text-lg">Buscando...</p>
        </div>

        <!-- Resultados: Tarjetas de Acceso -->
        <div v-else-if="searchResults.length > 0" class="w-full max-w-2xl space-y-4">
          <button
            v-for="member in searchResults"
            :key="member.id"
            type="button"
            :aria-label="`${canCheckIn(member) ? 'Registrar acceso permitido' : 'Registrar acceso denegado'} para ${member.nombre} ${member.apellido}`"
            @click="handleCheckIn(member)"
            class="w-full transform cursor-pointer rounded-3xl text-left transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 md:hover:scale-[1.02]"
          >
            <!-- ACCESO PERMITIDO -->
            <div
              v-if="canCheckIn(member)"
              class="rounded-3xl border-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-2xl dark:from-emerald-900/30 dark:to-teal-900/20 md:p-8"
            >
              <div class="flex items-center gap-3 md:gap-6">
                <!-- Avatar Grande -->
                <div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white shadow-lg md:h-24 md:w-24 md:text-3xl">
                  {{ getInitials(member.nombre, member.apellido) }}
                </div>
                
                <!-- Info -->
                <div class="flex-1">
                  <p class="mb-1 text-xl font-bold text-page-title md:text-3xl">
                    {{ member.nombre }} {{ member.apellido }}
                  </p>
                  <p class="mb-4 text-base text-gray-600 dark:text-gray-400 md:text-lg">DNI: {{ member.dni }}</p>
                  <div class="flex items-start gap-3 rounded-xl bg-white px-3 py-3 shadow-sm dark:bg-white/5 md:px-4">
                    <CheckCircle class="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-500 md:h-8 md:w-8" aria-hidden="true" />
                    <div class="flex-1">
                      <span class="block text-lg font-bold text-emerald-600 md:text-2xl">ACCESO PERMITIDO</span>
                      <span
                        v-if="member.estado_apto_fisico !== 'vigente'"
                        class="text-sm font-medium text-amber-600"
                      >
                        Aviso: apto físico vencido (no bloquea el check-in)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ACCESO DENEGADO -->
            <div
              v-else
              class="rounded-3xl border-4 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-2xl dark:from-red-900/30 dark:to-orange-900/20 md:p-8"
            >
              <div class="flex items-center gap-3 md:gap-6">
                <!-- Avatar Grande -->
                <div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xl font-bold text-white shadow-lg md:h-24 md:w-24 md:text-3xl">
                  {{ getInitials(member.nombre, member.apellido) }}
                </div>
                
                <!-- Info -->
                <div class="flex-1">
                  <p class="mb-1 text-xl font-bold text-page-title md:text-3xl">
                    {{ member.nombre }} {{ member.apellido }}
                  </p>
                  <p class="mb-4 text-base text-gray-600 dark:text-gray-400 md:text-lg">DNI: {{ member.dni }}</p>
                  <div class="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm dark:bg-white/5 md:px-4">
                    <AlertCircle class="h-6 w-6 flex-shrink-0 text-red-500 md:h-8 md:w-8" aria-hidden="true" />
                    <div class="flex-1">
                      <span class="block text-lg font-bold text-red-600 md:text-2xl">ACCESO DENEGADO</span>
                      <span class="text-base text-red-500 font-medium">
                        {{ accessDeniedReason(member) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="searchQuery && !loading" class="text-center text-gray-500 dark:text-gray-400 text-xl" role="status" aria-live="polite">
          <AlertCircle class="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <p>No se encontraron resultados</p>
          <p class="mt-2 text-base text-gray-400 dark:text-gray-500">
            Revisá el DNI o buscá por nombre y apellido.
          </p>
          <div class="mt-5 flex flex-wrap justify-center gap-3">
            <BaseButton variant="secondary" @click="clearSearch">Limpiar búsqueda</BaseButton>
            <BaseButton variant="primary" @click="router.push({ name: 'NewMember' })">Nuevo socio</BaseButton>
          </div>
        </div>

        <!-- Mensaje Inicial -->
      </div>

      <!-- Aside Lateral: Live Feed de Últimos Accesos -->
      <aside class="xl:w-80 bg-page-card xl:border-l border-gray-200 dark:border-gray-700 xl:overflow-y-auto">
        <div class="xl:sticky xl:top-0 bg-page-card border-b border-page-border p-4 md:p-6 z-10">
          <h2 class="text-lg font-semibold text-page-title flex items-center gap-2">
            <Activity class="h-5 w-5 text-primary-600" />
            Últimos Accesos
          </h2>
          <p class="text-xs text-gray-500 mt-1">Actividad en vivo · Se actualiza automáticamente</p>
        </div>
        
        <div v-if="recentCheckIns.length > 0" class="divide-y divide-gray-50 dark:divide-gray-700/50" aria-live="polite" aria-label="Últimos accesos registrados">
          <div
            v-for="checkIn in recentCheckIns"
            :key="checkIn.id"
            class="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <div class="flex items-center gap-3">
              <!-- Avatar circular -->
              <div class="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0">
                {{ getInitials(checkIn.member_name.split(' ')[0], checkIn.member_name.split(' ')[1]) }}
              </div>
              
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <!-- Indicador Visual (punto) -->
                  <div :class="[
                    'h-2 w-2 rounded-full flex-shrink-0',
                    checkIn.acceso_permitido ? 'bg-emerald-500' : 'bg-red-500'
                  ]"></div>
                  <p class="text-sm font-medium text-page-title truncate">
                    {{ checkIn.member_name }}
                  </p>
                </div>
                <p class="text-xs text-gray-400 mt-0.5 ml-4">
                  {{ formatTime(checkIn.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="p-8 text-center">
          <Activity class="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p class="text-gray-400 dark:text-gray-500 text-sm">Sin accesos recientes</p>
        </div>
      </aside>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppResume } from '@/composables/useAppResume'
import { useMembers } from '@/composables/useMembers'
import { useAttendance } from '@/composables/useAttendance'
import { BRAND } from '@/config/brand'
import { reportClientError } from '@/lib/observability'
import { CheckCircle, AlertCircle, Activity, CreditCard } from 'lucide-vue-next'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Swal from 'sweetalert2'

const searchQuery = ref('')
const router = useRouter()
const route = useRoute()
const isKioskMode = computed(() => route.query.kiosk === '1')
const searchResults = ref([])
const loading = ref(false)
const selectedAttendanceDate = ref(getTodayDateValue())
const { searchMembersForAccess } = useMembers()
const {
  recentCheckIns,
  loadRecentCheckIns,
  hasCheckInOnDate,
  registerCheckIn,
  subscribeToAttendanceInserts,
  unsubscribe: unsubscribeAttendance
} = useAttendance({ recentLimit: 10 })

let searchTimeout = null
let stopAttendanceSubscription = null

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

function exitKioskMode() {
  router.replace({ name: 'CheckIn' })
}

async function searchMembers() {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      searchResults.value = await searchMembersForAccess(searchQuery.value)
    } catch (error) {
      reportClientError('checkin.member_search', error)
    } finally {
      loading.value = false
    }
  }, 300)
}

function canCheckIn(member) {
  // REGLA DE NEGOCIO: la cuota activa habilita check-in.
  // El apto físico vencido se muestra como advertencia visual, pero no bloquea acceso.
  const cuotaActiva = member.estado_cuota === 'activo'
  
  if (!cuotaActiva) {
    if (import.meta.env.DEV) {
      console.debug('Check-in denegado', {
        estado_cuota: member.estado_cuota,
        estado_apto_fisico: member.estado_apto_fisico
      })
    }
  }
  
  return cuotaActiva
}

function accessDeniedReason(member) {
  if (member.activo === false) return 'Ficha de socio inactiva'
  if (member.estado_cuota === 'sin_pagos') return 'No hay pagos registrados'
  return 'Cuota vencida'
}

function getInitials(nombre, apellido) {
  const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : ''
  const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : ''
  return firstInitial + lastInitial
}

async function handleCheckIn(member) {
  const allowed = canCheckIn(member)
  
  try {
    const { startISO, endISO } = getDateRangeForQuery(selectedAttendanceDate.value)
    
    const existingCheckIn = await hasCheckInOnDate({
      memberId: member.id,
      startISO,
      endISO
    })

    // Si ya existe un check-in en la fecha seleccionada, mostrar mensaje y no registrar
    if (existingCheckIn) {
      const checkInTime = new Date(existingCheckIn.created_at).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
      const humanDate = formatDateForHuman(selectedAttendanceDate.value)

      await Swal.fire({
        title: 'Asistencia ya registrada',
        text: `${member.nombre} ${member.apellido} ya tiene asistencia el ${humanDate} a las ${checkInTime}.`,
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: BRAND.colors.primary,
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-xl font-bold text-gray-900',
          htmlContainer: 'text-gray-600',
          confirmButton: 'bg-primary-600 hover:bg-primary-700 px-6 py-2.5 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all'
        },
        buttonsStyling: false
      })
      
      // Limpiar búsqueda
      searchQuery.value = ''
      searchResults.value = []
      return
    }

    // Registrar asistencia
    const createdAtISO = buildCheckInDateTime(selectedAttendanceDate.value)

    await registerCheckIn({
      memberId: member.id,
      allowed,
      createdAt: createdAtISO
    })

    const humanDate = formatDateForHuman(selectedAttendanceDate.value)

    if (!allowed) {
      await Swal.fire({
        title: 'Acceso denegado',
        text: `${member.nombre} ${member.apellido} quedó registrado con acceso denegado por cuota vencida/inactiva (${humanDate}).`,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: BRAND.colors.primary,
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-xl font-bold text-gray-900',
          htmlContainer: 'text-gray-600',
          confirmButton: 'bg-primary-600 hover:bg-primary-700 px-6 py-2.5 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all'
        },
        buttonsStyling: false
      })
    } else {
      const aptoWarning = member.estado_apto_fisico !== 'vigente'
        ? ' Aviso: apto físico vencido.'
        : ''

      await Swal.fire({
        title: 'Asistencia registrada',
        text: `${member.nombre} ${member.apellido} registrado correctamente para el ${humanDate}.${aptoWarning}`,
        icon: 'success',
        confirmButtonText: 'Perfecto',
        confirmButtonColor: BRAND.colors.primary,
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-xl font-bold text-gray-900',
          htmlContainer: 'text-gray-600',
          confirmButton: 'bg-primary-600 hover:bg-primary-700 px-6 py-2.5 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all'
        },
        buttonsStyling: false
      })
    }

    // Limpiar búsqueda (Realtime se encarga de actualizar el feed)
    searchQuery.value = ''
    searchResults.value = []
  } catch (error) {
    reportClientError('checkin_failed', error)
    await Swal.fire({
      title: 'Error al registrar asistencia',
      text: 'Ocurrió un problema al guardar el check-in. Intentá nuevamente.',
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: BRAND.colors.primary,
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-gray-600',
        confirmButton: 'bg-primary-600 hover:bg-primary-700 px-6 py-2.5 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all'
      },
      buttonsStyling: false
    })
  }
}

function getTodayDateValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function setTodayDate() {
  selectedAttendanceDate.value = getTodayDateValue()
}

function getDateRangeForQuery(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const start = new Date(year, month - 1, day, 0, 0, 0)
  const end = new Date(year, month - 1, day + 1, 0, 0, 0)

  return {
    startISO: start.toISOString(),
    endISO: end.toISOString()
  }
}

function buildCheckInDateTime(dateValue) {
  const now = new Date()
  const [year, month, day] = dateValue.split('-').map(Number)
  const attendanceDateTime = new Date(
    year,
    month - 1,
    day,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  )

  return attendanceDateTime.toISOString()
}

function formatDateForHuman(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
}

// Suscripción a Supabase Realtime para actualizar el feed en vivo
function subscribeToAttendance() {
  stopAttendanceSubscription?.()
  stopAttendanceSubscription = subscribeToAttendanceInserts({
    channelName: 'checkin-attendance',
    limit: 10
  })
}

async function refreshCheckInView() {
  await loadRecentCheckIns()
  subscribeToAttendance()
}

onMounted(() => {
  refreshCheckInView()
})

useAppResume(async () => {
  await refreshCheckInView()
}, { minIntervalMs: 1500, showToast: true })

onUnmounted(() => {
  stopAttendanceSubscription?.()
  unsubscribeAttendance()
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

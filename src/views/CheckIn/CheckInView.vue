<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-page-bg dark:to-page-card transition-colors duration-200">
    <div class="min-h-[100dvh] flex flex-col xl:flex-row">
      
      <!-- Área Principal: Kiosco de Acceso -->
      <div class="flex-1 flex flex-col items-center justify-center p-6">
        
        <!-- Icono Decorativo + Header -->
        <div class="mb-8 text-center">
          <div class="mb-6 flex justify-center">
            <CreditCard class="w-16 h-16 text-gray-200 dark:text-gray-700" />
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-page-title mb-2">Acceso al Gimnasio</h1>
          <p class="text-page-subtitle text-lg">Escanea o ingresa tu DNI</p>
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
        <div v-if="loading" class="text-center">
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
            class="w-full text-left transform transition-transform cursor-pointer hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 rounded-3xl"
          >
            <!-- ACCESO PERMITIDO -->
            <div
              v-if="canCheckIn(member)"
              class="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 border-4 border-emerald-500 rounded-3xl p-8 shadow-2xl"
            >
              <div class="flex items-center gap-6">
                <!-- Avatar Grande -->
                <div class="h-24 w-24 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg">
                  {{ getInitials(member.nombre, member.apellido) }}
                </div>
                
                <!-- Info -->
                <div class="flex-1">
                  <p class="text-3xl font-bold text-page-title mb-1">
                    {{ member.nombre }} {{ member.apellido }}
                  </p>
                  <p class="text-lg text-gray-600 dark:text-gray-400 mb-4">DNI: {{ member.dni }}</p>
                  <div class="flex items-start gap-3 bg-white dark:bg-white/5 rounded-xl px-4 py-3 shadow-sm">
                    <CheckCircle class="h-8 w-8 text-emerald-500 mt-0.5" />
                    <div class="flex-1">
                      <span class="text-2xl font-bold text-emerald-600 block">ACCESO PERMITIDO</span>
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
              class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/20 border-4 border-red-500 rounded-3xl p-8 shadow-2xl"
            >
              <div class="flex items-center gap-6">
                <!-- Avatar Grande -->
                <div class="h-24 w-24 rounded-full bg-red-500 text-white flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg">
                  {{ getInitials(member.nombre, member.apellido) }}
                </div>
                
                <!-- Info -->
                <div class="flex-1">
                  <p class="text-3xl font-bold text-page-title mb-1">
                    {{ member.nombre }} {{ member.apellido }}
                  </p>
                  <p class="text-lg text-gray-600 dark:text-gray-400 mb-4">DNI: {{ member.dni }}</p>
                  <div class="flex items-center gap-3 bg-white dark:bg-white/5 rounded-xl px-4 py-3 shadow-sm">
                    <AlertCircle class="h-8 w-8 text-red-500" />
                    <div class="flex-1">
                      <span class="text-2xl font-bold text-red-600 block">ACCESO DENEGADO</span>
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
        
        <div v-if="recentCheckIns.length > 0" class="divide-y divide-gray-50 dark:divide-gray-700/50">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'
import { useAppResume } from '@/composables/useAppResume'
import { BRAND } from '@/config/brand'
import { CheckCircle, AlertCircle, Activity, CreditCard } from 'lucide-vue-next'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Swal from 'sweetalert2'

const searchQuery = ref('')
const router = useRouter()
const searchResults = ref([])
const recentCheckIns = ref([])
const loading = ref(false)
const selectedAttendanceDate = ref(getTodayDateValue())

let searchTimeout = null
let realtimeSubscription = null

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
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
      const query = searchQuery.value.toLowerCase()
      const { data } = await supabase
        .from('v_socios_estado')
        .select('*')
        .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,dni.ilike.%${query}%`)
        .limit(5)

      searchResults.value = data || []
    } catch (error) {
      console.error('Error buscando socios:', error)
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
    console.log('❌ Acceso denegado:', {
      nombre: `${member.nombre} ${member.apellido}`,
      dni: member.dni,
      estado_cuota: member.estado_cuota,
      estado_apto_fisico: member.estado_apto_fisico
    })
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
    
    const { data: existingCheckIn, error: checkError } = await supabase
      .from('attendance')
      .select('id, created_at')
      .eq('member_id', member.id)
      .gte('created_at', startISO)
      .lt('created_at', endISO)
      .limit(1)

    if (checkError) throw checkError

    // Si ya existe un check-in en la fecha seleccionada, mostrar mensaje y no registrar
    if (existingCheckIn && existingCheckIn.length > 0) {
      const checkInTime = new Date(existingCheckIn[0].created_at).toLocaleTimeString('es-AR', {
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

    const { error } = await supabase
      .from('attendance')
      .insert([{
        member_id: member.id,
        acceso_permitido: allowed,
        created_at: createdAtISO
      }])

    if (error) throw error

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
    console.error('Error en check-in:', error)
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

async function loadRecentCheckIns() {
  try {
    const { data } = await supabase
      .from('attendance')
      .select(`
        *,
        members:member_id (
          nombre,
          apellido
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    recentCheckIns.value = data?.map(item => ({
      ...item,
      member_name: `${item.members.nombre} ${item.members.apellido}`
    })) || []
  } catch (error) {
    console.error('Error cargando check-ins:', error)
  }
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

function removeAttendanceSubscription() {
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription)
    realtimeSubscription = null
  }
}

// Suscripción a Supabase Realtime para actualizar el feed en vivo
function subscribeToAttendance() {
  removeAttendanceSubscription()

  realtimeSubscription = supabase
    .channel('public:attendance')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'attendance' },
      () => {
        // Cuando entra un nuevo check-in, recargamos la lista
        loadRecentCheckIns()
      }
    )
    .subscribe()
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
  removeAttendanceSubscription()
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

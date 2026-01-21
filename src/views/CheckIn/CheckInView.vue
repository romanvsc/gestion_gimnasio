<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="h-screen flex flex-col lg:flex-row">
      
      <!-- Área Principal: Kiosco de Acceso -->
      <div class="flex-1 flex flex-col items-center justify-center p-6">
        
        <!-- Icono Decorativo + Header -->
        <div class="mb-8 text-center">
          <div class="mb-6 flex justify-center">
            <CreditCard class="w-16 h-16 text-gray-200" />
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-page-title mb-2">Acceso al Gimnasio</h1>
          <p class="text-page-subtitle text-lg">Escanea o ingresa tu DNI</p>
        </div>

        <!-- Buscador Gigante Centrado -->
        <div class="w-full max-w-2xl mb-8">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Ingresa DNI, nombre o apellido..."
            class="w-full text-2xl p-6 rounded-2xl border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none shadow-lg transition-all"
            @input="searchMembers"
            autofocus
          />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center">
          <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p class="text-gray-600 mt-4 text-lg">Buscando...</p>
        </div>

        <!-- Resultados: Tarjetas de Acceso -->
        <div v-else-if="searchResults.length > 0" class="w-full max-w-2xl space-y-4">
          <div
            v-for="member in searchResults"
            :key="member.id"
            @click="handleCheckIn(member)"
            class="transform transition-transform cursor-pointer hover:scale-[1.02]"
          >
            <!-- ACCESO PERMITIDO -->
            <div
              v-if="canCheckIn(member)"
              class="bg-gradient-to-r from-emerald-50 to-teal-50 border-4 border-emerald-500 rounded-3xl p-8 shadow-2xl"
            >
              <div class="flex items-center gap-6">
                <!-- Avatar Grande -->
                <div class="h-24 w-24 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg">
                  {{ getInitials(member.nombre, member.apellido) }}
                </div>
                
                <!-- Info -->
                <div class="flex-1">
                  <p class="text-3xl font-bold text-gray-900 mb-1">
                    {{ member.nombre }} {{ member.apellido }}
                  </p>
                  <p class="text-lg text-gray-600 mb-4">DNI: {{ member.dni }}</p>
                  <div class="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                    <CheckCircle class="h-8 w-8 text-emerald-500" />
                    <span class="text-2xl font-bold text-emerald-600">ACCESO PERMITIDO</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ACCESO DENEGADO -->
            <div
              v-else
              class="bg-gradient-to-r from-red-50 to-orange-50 border-4 border-red-500 rounded-3xl p-8 shadow-2xl"
            >
              <div class="flex items-center gap-6">
                <!-- Avatar Grande -->
                <div class="h-24 w-24 rounded-full bg-red-500 text-white flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg">
                  {{ getInitials(member.nombre, member.apellido) }}
                </div>
                
                <!-- Info -->
                <div class="flex-1">
                  <p class="text-3xl font-bold text-gray-900 mb-1">
                    {{ member.nombre }} {{ member.apellido }}
                  </p>
                  <p class="text-lg text-gray-600 mb-4">DNI: {{ member.dni }}</p>
                  <div class="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                    <AlertCircle class="h-8 w-8 text-red-500" />
                    <div class="flex-1">
                      <span class="text-2xl font-bold text-red-600 block">ACCESO DENEGADO</span>
                      <span class="text-base text-red-500 font-medium">
                        <span v-if="member.estado_cuota !== 'activo' && member.estado_apto_fisico !== 'vigente'">
                          Cuota y Apto Físico Vencidos
                        </span>
                        <span v-else-if="member.estado_cuota !== 'activo'">
                          Cuota Vencida
                        </span>
                        <span v-else>
                          Apto Físico Vencido
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="searchQuery && !loading" class="text-center text-gray-500 text-xl">
          <AlertCircle class="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p>No se encontraron resultados</p>
        </div>

        <!-- Mensaje Inicial -->
      </div>

      <!-- Aside Lateral: Live Feed de Últimos Accesos -->
      <aside class="lg:w-80 bg-white lg:border-l border-gray-200 lg:overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-100 p-6 z-10">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity class="h-5 w-5 text-primary-600" />
            Últimos Accesos
          </h2>
          <p class="text-xs text-gray-500 mt-1">Live Feed</p>
        </div>
        
        <div v-if="recentCheckIns.length > 0" class="divide-y divide-gray-50">
          <div
            v-for="checkIn in recentCheckIns"
            :key="checkIn.id"
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <!-- Avatar circular -->
              <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
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
                  <p class="text-sm font-medium text-gray-900 truncate">
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
          <Activity class="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p class="text-gray-400 text-sm">Sin accesos recientes</p>
        </div>
      </aside>
    </div>

    <!-- Modal de Confirmación Visual -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div 
        :class="[
          'rounded-3xl p-12 shadow-2xl max-w-lg w-full text-center transform transition-all',
          modalData.allowed ? 'bg-emerald-50 border-4 border-emerald-500' : 'bg-red-50 border-4 border-red-500'
        ]"
      >
        <!-- Icono -->
        <div :class="[
          'mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-6',
          modalData.allowed ? 'bg-emerald-500' : 'bg-red-500'
        ]">
          <CheckCircle v-if="modalData.allowed" class="h-16 w-16 text-white" />
          <AlertCircle v-else class="h-16 w-16 text-white" />
        </div>
        
        <!-- Texto -->
        <h3 :class="[
          'text-4xl font-bold mb-4',
          modalData.allowed ? 'text-emerald-900' : 'text-red-900'
        ]">
          {{ modalData.allowed ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO' }}
        </h3>
        
        <p class="text-lg text-gray-700 mb-8">
          {{ modalData.message }}
        </p>
        
        <button
          @click="closeModal"
          :class="[
            'w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-colors',
            modalData.allowed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
          ]"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Activity, CreditCard } from 'lucide-vue-next'

const searchQuery = ref('')
const searchResults = ref([])
const recentCheckIns = ref([])
const loading = ref(false)
const showModal = ref(false)
const modalData = ref({ allowed: true, message: '' })

let searchTimeout = null
let realtimeSubscription = null

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
  // REGLA ESTRICTA: Ambos deben estar en estado válido
  // - Cuota: debe ser 'activo'
  // - Apto Físico: debe ser 'vigente' (si está vencido no puede entrar)
  const cuotaActiva = member.estado_cuota === 'activo'
  const aptoVigente = member.estado_apto_fisico === 'vigente'
  
  // Debug: mostrar en consola para troubleshooting
  if (!cuotaActiva || !aptoVigente) {
    console.log('❌ Acceso denegado:', {
      nombre: `${member.nombre} ${member.apellido}`,
      dni: member.dni,
      estado_cuota: member.estado_cuota,
      estado_apto_fisico: member.estado_apto_fisico,
      cuotaActiva,
      aptoVigente
    })
  }
  
  return cuotaActiva && aptoVigente
}

function getInitials(nombre, apellido) {
  const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : ''
  const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : ''
  return firstInitial + lastInitial
}

async function handleCheckIn(member) {
  const allowed = canCheckIn(member)
  
  try {
    // Verificar si ya existe un check-in hoy para este socio
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()
    
    const { data: existingCheckIn, error: checkError } = await supabase
      .from('attendance')
      .select('id, created_at')
      .eq('member_id', member.id)
      .gte('created_at', todayISO)
      .limit(1)

    if (checkError) throw checkError

    // Si ya existe un check-in hoy, mostrar mensaje y no registrar
    if (existingCheckIn && existingCheckIn.length > 0) {
      const checkInTime = new Date(existingCheckIn[0].created_at).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      modalData.value = {
        allowed: false,
        message: `${member.nombre} ${member.apellido} ya registró su acceso hoy a las ${checkInTime}.`
      }
      showModal.value = true
      
      // Limpiar búsqueda
      searchQuery.value = ''
      searchResults.value = []
      return
    }

    // Registrar asistencia
    const { error } = await supabase
      .from('attendance')
      .insert([{
        member_id: member.id,
        acceso_permitido: allowed
      }])

    if (error) throw error

    // Mostrar modal
    let message = `Check-in registrado para ${member.nombre} ${member.apellido}.`
    if (!allowed) {
      const warnings = []
      if (member.estado_cuota !== 'activo') warnings.push('cuota vencida')
      if (member.estado_apto_fisico !== 'vigente') warnings.push('apto físico vencido')
      message += ` Advertencia: ${warnings.join(' y ')}.`
    }

    modalData.value = { allowed, message }
    showModal.value = true

    // Limpiar búsqueda (Realtime se encarga de actualizar el feed)
    searchQuery.value = ''
    searchResults.value = []
  } catch (error) {
    console.error('Error en check-in:', error)
    alert('Error al registrar check-in')
  }
}

function closeModal() {
  showModal.value = false
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

// Suscripción a Supabase Realtime para actualizar el feed en vivo
function subscribeToAttendance() {
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

onMounted(() => {
  loadRecentCheckIns()
  subscribeToAttendance()
})

onUnmounted(() => {
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription)
  }
})
</script>

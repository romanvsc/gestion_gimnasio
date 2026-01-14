<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Socios</h1>
        <p class="text-gray-500">Gestiona los miembros del gimnasio</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm p-8 text-center">
        <p class="text-gray-600">Cargando socios...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Contenedor principal -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header de la tarjeta -->
        <div class="px-6 py-4 border-b border-gray-100">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-4">
              <h2 class="text-lg font-semibold text-gray-800">Lista de Socios</h2>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="showInactive"
                  @change="handleToggleInactive"
                  class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span class="text-sm text-gray-600">Mostrar inactivos</span>
              </label>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre, apellido o DNI..."
                class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
              <button
                @click="goToNewMember"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                + Nuevo Socio
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla Desktop -->
        <div v-if="filteredMembers.length > 0" class="hidden md:block overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Foto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Socio
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Cuota
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                v-for="member in filteredMembers"
                :key="member.id"
                :class="[
                  'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  !member.activo && 'opacity-60'
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="h-10 w-10 flex-shrink-0">
                    <img
                      v-if="member.foto_url"
                      :src="member.foto_url"
                      :alt="`${member.nombre} ${member.apellido}`"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                    <div v-else class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <span class="text-sm font-semibold text-slate-600">
                        {{ getInitials(member.nombre, member.apellido) }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="cursor-pointer" @click="goToMemberDetail(member.id)">
                    <div class="text-sm font-medium text-gray-900 hover:text-emerald-600 flex items-center gap-2">
                      {{ member.nombre }} {{ member.apellido }}
                      <span v-if="member.es_socio_club" class="text-yellow-500" title="Socio Club">⭐</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ member.dni }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ member.email || '-' }}</div>
                  <div class="text-sm text-gray-500">{{ member.telefono || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    :status="member.estado_cuota"
                    :label="member.estado_cuota === 'activo' ? 'Al día' : 'Vencido'"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    :type="member.activo ? 'success' : 'secondary'"
                  >
                    {{ member.activo ? 'Activo' : 'Inactivo' }}
                  </StatusBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click.stop="openHistoryModal(member, 'payments')"
                      class="p-2 hover:bg-emerald-50 rounded-lg transition-colors group"
                      title="Ver Pagos"
                    >
                      <Receipt class="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                    </button>
                    <button
                      @click.stop="openHistoryModal(member, 'attendance')"
                      class="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                      title="Ver Asistencias"
                    >
                      <CalendarClock class="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Mobile -->
        <div v-if="filteredMembers.length > 0" class="md:hidden">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            :class="[
              'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0',
              !member.activo && 'opacity-60'
            ]"
            @click="goToMemberDetail(member.id)"
          >
            <div class="flex items-start mb-3">
              <div class="h-10 w-10 flex-shrink-0">
                <img
                  v-if="member.foto_url"
                  :src="member.foto_url"
                  :alt="`${member.nombre} ${member.apellido}`"
                  class="h-10 w-10 rounded-full object-cover"
                />
                <div v-else class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span class="text-sm font-semibold text-slate-600">
                    {{ getInitials(member.nombre, member.apellido) }}
                  </span>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-sm font-medium text-gray-900 flex items-center gap-1">
                  {{ member.nombre }} {{ member.apellido }}
                  <span v-if="member.es_socio_club" class="text-yellow-500" title="Socio Club">⭐</span>
                </h3>
                <p class="text-sm text-gray-500">DNI: {{ member.dni }}</p>
              </div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="flex gap-2 flex-wrap">
                <StatusBadge
                  :status="member.estado_cuota"
                  :label="member.estado_cuota === 'activo' ? 'Al día' : 'Vencido'"
                  size="sm"
                />
                <StatusBadge
                  :type="member.activo ? 'success' : 'secondary'"
                  size="sm"
                >
                  {{ member.activo ? 'Activo' : 'Inactivo' }}
                </StatusBadge>
              </div>
              <div class="flex gap-2">
                <button
                  @click.stop="openHistoryModal(member, 'payments')"
                  class="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Receipt class="w-5 h-5 text-emerald-600" />
                </button>
                <button
                  @click.stop="openHistoryModal(member, 'attendance')"
                  class="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <CalendarClock class="w-5 h-5 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-if="filteredMembers.length === 0" class="p-8 text-center">
          <p class="text-gray-500">No se encontraron socios</p>
        </div>
      </div>
    </div>

    <!-- Modal de Historial -->
    <MemberHistoryModal
      v-if="showHistoryModal"
      :member-id="selectedMemberId"
      :member-name="selectedMemberName"
      @close="showHistoryModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMembers } from '@/composables/useMembers'
import { Receipt, CalendarClock } from 'lucide-vue-next'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import MemberHistoryModal from '@/components/modals/MemberHistoryModal.vue'

const router = useRouter()
const { members, loading, error, getMembers } = useMembers()

const searchQuery = ref('')
const showInactive = ref(false)
const showHistoryModal = ref(false)
const selectedMemberId = ref('')
const selectedMemberName = ref('')

// Función para obtener iniciales
function getInitials(nombre, apellido) {
  const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : ''
  const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : ''
  return firstInitial + lastInitial
}

// Manejar cambio en toggle de inactivos
async function handleToggleInactive() {
  await getMembers(showInactive.value)
}

// Filtrar socios por búsqueda
const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value

  const query = searchQuery.value.toLowerCase()
  return members.value.filter(member => {
    const fullName = `${member.nombre} ${member.apellido}`.toLowerCase()
    const dni = member.dni?.toString() || ''
    return fullName.includes(query) || dni.includes(query)
  })
})

function goToNewMember() {
  router.push({ name: 'NewMember' })
}

function goToMemberDetail(id) {
  router.push({ name: 'MemberDetail', params: { id } })
}

function openHistoryModal(member, tab = 'payments') {
  selectedMemberId.value = member.id
  selectedMemberName.value = `${member.nombre} ${member.apellido}`
  showHistoryModal.value = true
}

onMounted(async () => {
  await getMembers(showInactive.value)
})
</script>

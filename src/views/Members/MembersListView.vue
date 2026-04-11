<template>
  <div class="min-h-screen bg-page-bg transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 py-6 md:py-8">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-page-title">Socios</h1>
          <p class="text-page-subtitle">Gestiona los miembros del gimnasio</p>
        </div>
        <BaseButton 
          variant="primary" 
          size="lg"
          @click="goToNewMember"
        >
          <UserPlus class="w-5 h-5 mr-2" />
          Nuevo Socio
        </BaseButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-page-card rounded-xl shadow-sm p-8 text-center">
        <p class="text-gray-600 dark:text-gray-400">Cargando socios...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <template v-else>
        <!-- Filtros -->
        <div class="bg-page-card rounded-xl shadow-sm border border-page-border p-4 mb-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <BaseInput
                v-model="searchQuery"
                placeholder="Buscar por nombre, apellido o DNI..."
                size="lg"
              >
                <template #prefix>
                  <Search class="w-5 h-5 text-gray-400" />
                </template>
              </BaseInput>
            </div>
            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer touch-manipulation">
              <input 
                type="checkbox" 
                v-model="showInactive"
                @change="handleToggleInactive"
                class="w-5 h-5 rounded border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-primary-500 dark:bg-gray-800"
              />
              Mostrar inactivos
            </label>
          </div>
        </div>

        <!-- Empty state (cuando no hay socios) -->
        <div v-if="filteredMembers.length === 0" class="text-center py-12 bg-page-card rounded-xl shadow-sm border border-page-border">
          <Users class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p class="text-lg font-medium text-gray-600 dark:text-gray-400">No se encontraron socios</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Prueba ajustando los filtros o agrega un nuevo socio</p>
        </div>

        <!-- Vista Mobile: Cards -->
        <div v-else class="md:hidden space-y-3">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="bg-page-card rounded-xl shadow-sm border border-page-border p-4 touch-manipulation active:bg-page-card-hover transition-colors"
            @click="goToMemberDetail(member.id)"
          >
            <div class="flex items-start gap-4">
              <!-- Avatar -->
              <div class="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                <img
                  v-if="member.foto_url"
                  :src="member.foto_url"
                  :alt="`${member.nombre} ${member.apellido}`"
                  class="w-14 h-14 rounded-full object-cover"
                />
                <span v-else class="text-lg font-bold text-primary-700 dark:text-primary-300">
                  {{ getInitials(member.nombre, member.apellido) }}
                </span>
              </div>
              
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-page-title truncate flex items-center gap-1.5">
                  {{ member.nombre }} {{ member.apellido }}
                  <img 
                    v-if="member.es_socio_club" 
                    src="https://img.icons8.com/pulsar-gradient/50/instagram-check-mark.png" 
                    alt="Socio Club" 
                    title="Socio Club"
                    class="w-5 h-5"
                  />
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">DNI: {{ member.dni }}</p>
                
                <!-- Badges -->
                <div class="flex flex-wrap gap-2 mt-2">
                  <StatusBadge :status="member.estado_cuota" type="cuota" size="sm" />
                  <StatusBadge :status="member.estado_apto_fisico" type="apto" size="sm" />
                  <StatusBadge 
                    v-if="!member.activo"
                    type="secondary"
                    size="sm"
                  >
                    Inactivo
                  </StatusBadge>
                </div>
              </div>

              <!-- Chevron -->
              <ChevronRight class="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        </div>

        <!-- Vista Desktop: Tabla -->
        <div v-if="filteredMembers.length > 0" class="hidden md:block bg-page-card rounded-xl shadow-sm border border-page-border overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-white/5 border-b border-page-border">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Socio</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">DNI</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cuota</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apto Físico</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
              <tr 
                v-for="member in filteredMembers" 
                :key="member.id"
                class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                :class="{ 'opacity-60': !member.activo }"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                      <img
                        v-if="member.foto_url"
                        :src="member.foto_url"
                        :alt="`${member.nombre} ${member.apellido}`"
                        class="w-10 h-10 rounded-full object-cover"
                      />
                      <span v-else class="text-sm font-bold text-primary-700 dark:text-primary-300">
                        {{ getInitials(member.nombre, member.apellido) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-page-title flex items-center gap-1.5">
                        {{ member.nombre }} {{ member.apellido }}
                        <img 
                          v-if="member.es_socio_club" 
                          src="https://img.icons8.com/pulsar-gradient/50/instagram-check-mark.png" 
                          alt="Socio Club" 
                          title="Socio Club"
                          class="w-5 h-5"
                        />
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ member.dni }}</td>
                <td class="px-6 py-4">
                  <p class="text-gray-600 dark:text-gray-400">{{ member.email || '—' }}</p>
                  <p class="text-sm text-gray-400 dark:text-gray-500">{{ member.telefono || '—' }}</p>
                </td>
                <td class="px-6 py-4 text-center">
                  <StatusBadge :status="member.estado_cuota" type="cuota" />
                </td>
                <td class="px-6 py-4 text-center">
                  <StatusBadge :status="member.estado_apto_fisico" type="apto" />
                </td>
                <td class="px-6 py-4 text-center">
                  <StatusBadge :status="member.activo ? 'activo' : 'inactivo'" type="estado">
                    {{ member.activo ? 'Activo' : 'Inactivo' }}
                  </StatusBadge>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      @click="goToMemberDetail(member.id)"
                      title="Ver detalle"
                    >
                      <Eye class="w-5 h-5" />
                    </BaseButton>
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      @click.stop="openHistoryModal(member, 'payments')"
                      title="Historial de pagos"
                    >
                      <Receipt class="w-5 h-5" />
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Contador -->
        <p v-if="filteredMembers.length > 0" class="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center md:text-left">
          {{ filteredMembers.length }} socio(s) encontrado(s)
        </p>
      </template>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMembers } from '@/composables/useMembers'
import { Search, UserPlus, ChevronRight, Users, Eye, Receipt } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import MemberHistoryModal from '@/components/modals/MemberHistoryModal.vue'

const router = useRouter()
const { members, loading, error, getMembers } = useMembers()

const searchQuery = ref('')
const showInactive = ref(false)
const showHistoryModal = ref(false)
const selectedMemberId = ref('')
const selectedMemberName = ref('')

function getInitials(nombre, apellido) {
  const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : ''
  const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : ''
  return firstInitial + lastInitial
}

async function handleToggleInactive() {
  await getMembers(showInactive.value)
}

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

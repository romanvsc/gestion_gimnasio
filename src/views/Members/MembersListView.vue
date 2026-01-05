<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Socios</h1>
          <p class="text-gray-600">Gestiona los miembros del gimnasio</p>
        </div>
        <BaseButton
          variant="primary"
          @click="goToNewMember"
        >
          + Nuevo Socio
        </BaseButton>
      </div>

      <!-- Buscador -->
      <div class="mb-6">
        <BaseInput
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">Cargando socios...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Tabla de socios -->
      <div v-else-if="filteredMembers.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Tabla Desktop -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
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
                  Apto Físico
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="member in filteredMembers"
                :key="member.id"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                @click="goToMemberDetail(member.id)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ member.nombre }} {{ member.apellido }}
                      </div>
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
                    :status="member.estado_apto_fisico === 'vigente' ? 'vigente' : 'vencido_apto'"
                    :label="member.estado_apto_fisico === 'vigente' ? 'Vigente' : 'Vencido'"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Mobile -->
        <div class="md:hidden divide-y divide-gray-200">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="goToMemberDetail(member.id)"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="text-sm font-medium text-gray-900">
                  {{ member.nombre }} {{ member.apellido }}
                </h3>
                <p class="text-sm text-gray-500">DNI: {{ member.dni }}</p>
              </div>
            </div>
            <div class="flex gap-2 mt-2">
              <StatusBadge
                :status="member.estado_cuota"
                :label="member.estado_cuota === 'activo' ? 'Al día' : 'Vencido'"
              />
              <StatusBadge
                :status="member.estado_apto_fisico === 'vigente' ? 'vigente' : 'vencido_apto'"
                :label="member.estado_apto_fisico === 'vigente' ? 'Apto OK' : 'Apto Vencido'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sin resultados -->
      <div v-else class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">No se encontraron socios</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMembers } from '@/composables/useMembers'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const router = useRouter()
const { members, loading, error, getMembers } = useMembers()

const searchQuery = ref('')

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

onMounted(async () => {
  await getMembers()
})
</script>

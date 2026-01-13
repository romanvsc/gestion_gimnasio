<template>
  <div class="p-4 md:p-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p class="text-gray-600 mt-1">Administra el personal del gimnasio</p>
      </div>
      <BaseButton @click="openCreateModal" color="primary">
        <UserPlus class="w-5 h-5 mr-2" />
        Nuevo Usuario
      </BaseButton>
    </div>

    <!-- Loading -->
    <div v-if="loading && staffList.length === 0" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Cargando usuarios...</p>
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden md:block bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="staff in staffList" :key="staff.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div 
                  class="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  :style="{ backgroundColor: getColorFromString(staff.usuario) }"
                >
                  {{ getInitials(staff.usuario) }}
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ staff.usuario }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ staff.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <StatusBadge :type="staff.rol === 'admin' ? 'success' : 'info'">
                {{ staff.rol === 'admin' ? 'Admin' : 'Recepción' }}
              </StatusBadge>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <StatusBadge :type="staff.activo ? 'success' : 'danger'">
                {{ staff.activo ? 'Activo' : 'Inactivo' }}
              </StatusBadge>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <BaseButton 
                @click="openEditModal(staff)" 
                color="secondary" 
                size="sm"
                class="mr-2"
              >
                <Edit class="w-4 h-4" />
              </BaseButton>
              <BaseButton 
                @click="handleToggleStatus(staff)" 
                :color="staff.activo ? 'danger' : 'success'" 
                size="sm"
              >
                <component :is="staff.activo ? XCircle : CheckCircle" class="w-4 h-4" />
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="staffList.length === 0" class="text-center py-12">
        <Users class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-600">No hay usuarios registrados</p>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-4">
      <div 
        v-for="staff in staffList" 
        :key="staff.id"
        class="bg-white rounded-lg shadow p-4"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center">
            <div 
              class="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold"
              :style="{ backgroundColor: getColorFromString(staff.usuario) }"
            >
              {{ getInitials(staff.usuario) }}
            </div>
            <div class="ml-3">
              <div class="text-sm font-medium text-gray-900">{{ staff.usuario }}</div>
              <div class="text-xs text-gray-500">{{ staff.email }}</div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-3">
          <div class="flex gap-2">
            <StatusBadge :type="staff.rol === 'admin' ? 'success' : 'info'" size="sm">
              {{ staff.rol === 'admin' ? 'Admin' : 'Recepción' }}
            </StatusBadge>
            <StatusBadge :type="staff.activo ? 'success' : 'danger'" size="sm">
              {{ staff.activo ? 'Activo' : 'Inactivo' }}
            </StatusBadge>
          </div>
        </div>

        <div class="flex gap-2">
          <BaseButton 
            @click="openEditModal(staff)" 
            color="secondary" 
            size="sm"
            class="flex-1"
          >
            <Edit class="w-4 h-4 mr-1" />
            Editar
          </BaseButton>
          <BaseButton 
            @click="handleToggleStatus(staff)" 
            :color="staff.activo ? 'danger' : 'success'" 
            size="sm"
            class="flex-1"
          >
            <component :is="staff.activo ? XCircle : CheckCircle" class="w-4 h-4 mr-1" />
            {{ staff.activo ? 'Desactivar' : 'Activar' }}
          </BaseButton>
        </div>
      </div>

      <!-- Empty State Mobile -->
      <div v-if="staffList.length === 0" class="text-center py-12">
        <Users class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-600">No hay usuarios registrados</p>
      </div>
    </div>

    <!-- Modal -->
    <StaffFormModal
      v-if="showModal"
      :staff="selectedStaff"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Users, UserPlus, Edit, XCircle, CheckCircle } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import StaffFormModal from '@/components/staff/StaffFormModal.vue'
import { useStaff } from '@/composables/useStaff'

const { staffList, loading, loadStaff, toggleStatus } = useStaff()

const showModal = ref(false)
const selectedStaff = ref(null)

onMounted(() => {
  loadStaff()
})

const openCreateModal = () => {
  selectedStaff.value = null
  showModal.value = true
}

const openEditModal = (staff) => {
  selectedStaff.value = staff
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedStaff.value = null
}

const handleSuccess = () => {
  closeModal()
}

const handleToggleStatus = async (staff) => {
  const action = staff.activo ? 'desactivar' : 'activar'
  if (!confirm(`¿Estás seguro de ${action} a ${staff.usuario}?`)) return

  const result = await toggleStatus(staff.id, staff.activo)
  if (result.success) {
    alert(`Usuario ${action === 'desactivar' ? 'desactivado' : 'activado'} correctamente`)
  } else {
    alert(`Error al ${action} usuario: ${result.error}`)
  }
}

// Generar iniciales del nombre
const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Generar color consistente desde string
const getColorFromString = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
  ]
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <!-- Overlay -->
        <div 
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="$emit('close')"
        ></div>

        <!-- Modal Panel -->
        <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <!-- Header -->
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserX class="w-5 h-5" />
                Socios Inactivos ({{ members.length }})
              </h3>
              <button 
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Tabla -->
          <div class="px-6 py-4 max-h-96 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apellido y Nombre</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Baja</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ member.dni }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">
                    {{ member.apellido }}, {{ member.nombre }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ member.email || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ member.telefono || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">
                    {{ formatDate(member.fecha_baja) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <p class="text-sm text-gray-600">
              Total: {{ members.length }} socios
            </p>
            <div class="flex gap-3">
              <BaseButton variant="secondary" @click="$emit('close')">
                Cerrar
              </BaseButton>
              <BaseButton variant="primary" @click="$emit('export')">
                <Download class="w-4 h-4 mr-2" />
                Exportar Excel
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { UserX, X, Download } from 'lucide-vue-next'
import { formatDate } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  members: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close', 'export'])
</script>

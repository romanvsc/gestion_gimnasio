<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <BaseButton
          variant="ghost"
          @click="goBack"
        >
          ← Volver
        </BaseButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">Cargando datos del socio...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Contenido -->
      <div v-else-if="currentMember" class="space-y-6">
        <!-- Header con nombre y botón editar -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                {{ currentMember.nombre }} {{ currentMember.apellido }}
              </h1>
              <p class="text-gray-600">DNI: {{ currentMember.dni }}</p>
            </div>
            <BaseButton
              variant="primary"
              @click="goToEdit"
            >
              Editar
            </BaseButton>
          </div>
        </div>

        <!-- Tarjetas de Estado -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Estado de Cuota -->
          <div 
            :class="[
              'rounded-lg shadow p-6',
              memberStatus.cuotaVencida ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'
            ]"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Estado de Cuota</h3>
              <StatusBadge
                :status="memberStatus.cuotaVencida ? 'vencido' : 'activo'"
                :label="memberStatus.cuotaVencida ? 'Vencida' : 'Al día'"
              />
            </div>
            <p :class="memberStatus.cuotaVencida ? 'text-red-700' : 'text-green-700'">
              {{ memberStatus.cuotaMessage }}
            </p>
          </div>

          <!-- Estado de Apto Físico -->
          <div 
            :class="[
              'rounded-lg shadow p-6',
              memberStatus.aptoVencido ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-blue-50 border-2 border-blue-200'
            ]"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Apto Físico</h3>
              <StatusBadge
                :status="memberStatus.aptoVencido ? 'vencido_apto' : 'vigente'"
                :label="memberStatus.aptoVencido ? 'Vencido' : 'Vigente'"
              />
            </div>
            <p :class="memberStatus.aptoVencido ? 'text-yellow-700' : 'text-blue-700'">
              {{ memberStatus.aptoMessage }}
            </p>
          </div>
        </div>

        <!-- Datos Personales -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Datos Personales</h2>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(currentMember.fecha_nacimiento) || '-' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ currentMember.email || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ currentMember.telefono || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Alta</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(currentMember.created_at) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- TODO: Historial de Pagos -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Historial de Pagos</h2>
          <!-- TODO: Aquí irá la tabla de pagos del socio -->
          <p class="text-gray-500 text-center py-8">
            Próximamente: Historial de pagos
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMembers } from '@/composables/useMembers'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const router = useRouter()
const route = useRoute()
const { currentMember, loading, error, getMemberById } = useMembers()

const memberStatus = computed(() => {
  if (!currentMember.value) return {}

  const today = new Date()
  
  // Calcular estado de cuota (simplificado, ajusta según tu lógica)
  const cuotaVencida = true // TODO: Calcular basándote en último pago
  const cuotaMessage = cuotaVencida 
    ? 'El socio tiene la cuota vencida' 
    : 'El socio está al día con sus pagos'

  // Calcular estado de apto físico
  let aptoVencido = false
  let aptoMessage = 'No tiene apto físico registrado'
  
  if (currentMember.value.apto_fisico) {
    const aptoDate = new Date(currentMember.value.apto_fisico)
    aptoVencido = aptoDate < today
    aptoMessage = aptoVencido
      ? `Apto físico vencido el ${formatDate(currentMember.value.apto_fisico)}`
      : `Apto físico vigente hasta el ${formatDate(currentMember.value.apto_fisico)}`
  }

  return {
    cuotaVencida,
    cuotaMessage,
    aptoVencido,
    aptoMessage
  }
})

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR')
}

function goBack() {
  router.push({ name: 'Members' })
}

function goToEdit() {
  router.push({ name: 'EditMember', params: { id: route.params.id } })
}

onMounted(async () => {
  await getMemberById(route.params.id)
})
</script>

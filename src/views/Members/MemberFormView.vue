<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-3xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <BaseButton
          variant="ghost"
          @click="goBack"
        >
          ← Volver
        </BaseButton>
      </div>

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ isEditing ? 'Editar Socio' : 'Nuevo Socio' }}
        </h1>
        <p class="text-gray-600">
          {{ isEditing ? 'Actualiza la información del socio' : 'Completa el formulario para agregar un nuevo socio' }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading && isEditing" class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">Cargando datos del socio...</p>
      </div>

      <!-- Formulario -->
      <div v-else class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Nombre y Apellido -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.nombre"
              label="Nombre"
              placeholder="Juan"
              required
              :error="formErrors.nombre"
            />

            <BaseInput
              v-model="formData.apellido"
              label="Apellido"
              placeholder="Pérez"
              required
              :error="formErrors.apellido"
            />
          </div>

          <!-- DNI -->
          <BaseInput
            v-model="formData.dni"
            type="number"
            label="DNI"
            placeholder="12345678"
            required
            :error="formErrors.dni"
          />

          <!-- Fecha de Nacimiento -->
          <BaseInput
            v-model="formData.fecha_nacimiento"
            type="date"
            label="Fecha de Nacimiento"
            :error="formErrors.fecha_nacimiento"
          />

          <!-- Apto Físico -->
          <BaseInput
            v-model="formData.apto_fisico"
            type="date"
            label="Fecha de Apto Físico"
            hint="Fecha de vencimiento del apto físico"
            :error="formErrors.apto_fisico"
          />

          <!-- Email y Teléfono -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.email"
              type="email"
              label="Email"
              placeholder="juan@example.com"
              :error="formErrors.email"
            />

            <BaseInput
              v-model="formData.telefono"
              type="tel"
              label="Teléfono"
              placeholder="11-1234-5678"
              :error="formErrors.telefono"
            />
          </div>

          <!-- Error general -->
          <div 
            v-if="error" 
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {{ error }}
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <BaseButton
              type="submit"
              variant="primary"
              :loading="loading"
            >
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </BaseButton>

            <BaseButton
              type="button"
              variant="secondary"
              @click="goBack"
              :disabled="loading"
            >
              Cancelar
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMembers } from '@/composables/useMembers'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const route = useRoute()
const { loading, error, getMemberById, createMember, updateMember } = useMembers()

const isEditing = computed(() => !!route.params.id)

const formData = ref({
  nombre: '',
  apellido: '',
  dni: '',
  fecha_nacimiento: '',
  apto_fisico: '',
  email: '',
  telefono: ''
})

const formErrors = ref({
  nombre: '',
  apellido: '',
  dni: '',
  fecha_nacimiento: '',
  apto_fisico: '',
  email: '',
  telefono: ''
})

function validateForm() {
  let isValid = true
  formErrors.value = {}

  if (!formData.value.nombre.trim()) {
    formErrors.value.nombre = 'El nombre es requerido'
    isValid = false
  }

  if (!formData.value.apellido.trim()) {
    formErrors.value.apellido = 'El apellido es requerido'
    isValid = false
  }

  if (!formData.value.dni) {
    formErrors.value.dni = 'El DNI es requerido'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  const result = isEditing.value
    ? await updateMember(route.params.id, formData.value)
    : await createMember(formData.value)

  if (result.success) {
    router.push({ name: 'Members' })
  }
}

function goBack() {
  router.push({ name: 'Members' })
}

onMounted(async () => {
  if (isEditing.value) {
    const result = await getMemberById(route.params.id)
    if (result.success) {
      formData.value = { ...result.data }
    }
  }
})
</script>

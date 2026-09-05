<template>
  <BaseModal
    :model-value="show"
    :title="isEditing ? 'Editar Plan' : 'Nuevo Plan'"
    size="md"
    :max-body-height="'calc(100dvh - var(--mobile-nav-height) - 5rem)'"
    @close="handleClose"
  >
    <div class="space-y-4">
      <BaseInput
        v-model="form.nombre"
        label="Nombre del plan"
        placeholder="Ej: Mensual, Trimestral..."
        size="lg"
        required
      />

      <BaseInput
        v-model.number="form.dias_duracion"
        label="Duración (días)"
        type="number"
        placeholder="30"
        size="lg"
        required
      />

      <BaseInput
        v-model.number="form.precio"
        label="Precio regular"
        type="number"
        placeholder="5000"
        size="lg"
        required
      >
        <template #prefix>
          <span class="text-gray-500 dark:text-gray-400">$</span>
        </template>
      </BaseInput>

      <BaseInput
        v-model.number="form.precio_socio"
        label="Precio socio (opcional)"
        type="number"
        placeholder="4500"
        size="lg"
      >
        <template #prefix>
          <span class="text-gray-500 dark:text-gray-400">$</span>
        </template>
      </BaseInput>

      <div class="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-white/5">
        <div>
          <p class="font-medium text-page-title">Plan activo</p>
          <p class="text-sm text-page-subtitle">Los planes inactivos no aparecen al registrar pagos</p>
        </div>
        <button
          type="button"
          @click="form.activo = !form.activo"
          :aria-pressed="form.activo"
          :aria-label="form.activo ? 'Desactivar plan' : 'Activar plan'"
          class="relative h-8 w-14 rounded-full transition-colors duration-200 touch-manipulation"
          :class="form.activo ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'"
        >
          <span
            class="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200"
            :class="form.activo ? 'left-7' : 'left-1'"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <BaseButton
          variant="ghost"
          class="flex-1"
          size="lg"
          @click="handleClose"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          class="flex-1"
          size="lg"
          :loading="saving"
          @click="handleSave"
        >
          {{ isEditing ? 'Guardar cambios' : 'Crear plan' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  plan: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)

const defaultForm = {
  nombre: '',
  dias_duracion: 30,
  precio: null,
  precio_socio: null,
  activo: true
}

const form = ref({ ...defaultForm })
const isEditing = computed(() => !!props.plan?.id)

watch(() => props.show, (newValue) => {
  if (!newValue) return

  form.value = props.plan
    ? {
        nombre: props.plan.nombre || '',
        dias_duracion: props.plan.dias_duracion || 30,
        precio: props.plan.precio ?? null,
        precio_socio: props.plan.precio_socio ?? null,
        activo: props.plan.activo !== false
      }
    : { ...defaultForm }
})

function handleClose() {
  emit('close')
}

async function handleSave() {
  if (!form.value.nombre?.trim()) {
    toast.error('Ingresa un nombre para el plan')
    return
  }

  if (!form.value.dias_duracion || form.value.dias_duracion < 1) {
    toast.error('Ingresa una duración válida')
    return
  }

  if (form.value.precio === null || form.value.precio === undefined || form.value.precio < 0) {
    toast.error('Ingresa un precio válido')
    return
  }

  saving.value = true

  try {
    emit('save', {
      id: props.plan?.id,
      ...form.value
    })
  } finally {
    saving.value = false
  }
}
</script>

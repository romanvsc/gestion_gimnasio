<template>
  <BaseModal
    :model-value="modelValue"
    :title="shift ? 'Editar jornada' : 'Cargar jornada'"
    size="sm"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form id="work-shift-form" class="space-y-4" @submit.prevent="handleSubmit">
      <div class="rounded-xl bg-page-bg p-3 text-sm text-page-subtitle">
        <p class="font-semibold capitalize text-page-title">{{ dateLabel }}</p>
        <p v-if="staffName" class="mt-1">{{ staffName }}</p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseInput id="work-start-time" v-model="form.start_time" type="time" label="Entrada" required step="60" />
        <BaseInput id="work-end-time" v-model="form.end_time" type="time" label="Salida" required step="60" />
      </div>

      <p v-if="formError" id="work-shift-form-error" role="alert" class="text-sm text-danger-600 dark:text-danger-400">
        {{ formError }}
      </p>

      <p class="text-xs text-page-subtitle">La salida debe ser posterior a la entrada. No se permiten turnos que crucen medianoche.</p>
    </form>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <BaseButton type="button" variant="secondary" :disabled="saving" @click="$emit('update:modelValue', false)">Cancelar</BaseButton>
        <BaseButton type="submit" form="work-shift-form" :loading="saving">Guardar jornada</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  date: { type: String, required: true },
  shift: { type: Object, default: null },
  staffName: { type: String, default: '' },
  saving: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])
const form = ref({ start_time: '', end_time: '' })
const formError = ref('')

const dateLabel = computed(() => new Intl.DateTimeFormat('es-AR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${props.date}T00:00:00Z`)))

watch(() => [props.modelValue, props.shift, props.date], () => {
  form.value = {
    start_time: props.shift?.start_time || '',
    end_time: props.shift?.end_time || ''
  }
  formError.value = ''
}, { immediate: true })

function handleSubmit() {
  formError.value = ''

  if (!form.value.start_time || !form.value.end_time) {
    formError.value = 'Completá la hora de entrada y la hora de salida.'
    return
  }

  if (form.value.end_time <= form.value.start_time) {
    formError.value = 'La hora de salida debe ser posterior a la hora de entrada.'
    return
  }

  emit('save', {
    id: props.shift?.id || null,
    start_time: form.value.start_time,
    end_time: form.value.end_time
  })
}
</script>

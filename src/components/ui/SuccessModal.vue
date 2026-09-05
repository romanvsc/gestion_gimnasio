<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    size="sm"
    :show-close="false"
    :max-body-height="'calc(100dvh - var(--mobile-nav-height) - 8rem)'"
    @close="close"
  >
    <template #icon>
      <component :is="iconComponent" class="h-5 w-5" :class="iconColorClass" aria-hidden="true" />
    </template>

    <div class="py-2 text-center">
      <div class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full shadow-lg ring-4 ring-white dark:ring-page-card" :class="iconBgClass">
        <component :is="iconComponent" class="h-10 w-10" :class="iconColorClass" aria-hidden="true" />
      </div>
      <p class="text-base leading-relaxed text-page-subtitle">{{ message }}</p>

      <div v-if="$slots.default" class="mt-5 rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
        <slot />
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="close"
        class="w-full rounded-xl px-4 py-3 font-semibold text-white transition-all hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        :class="buttonClass"
      >
        {{ buttonText }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (val) => ['success', 'warning', 'error', 'info'].includes(val)
  },
  title: {
    type: String,
    default: '¡Operación exitosa!'
  },
  message: {
    type: String,
    default: 'Los cambios se han guardado correctamente.'
  },
  buttonText: {
    type: String,
    default: 'Entendido'
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const typeConfig = computed(() => ({
  success: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    button: 'bg-emerald-600 hover:bg-emerald-700'
  },
  warning: {
    iconBg: 'bg-warning-100 dark:bg-warning-900/30',
    iconColor: 'text-warning-700 dark:text-warning-300',
    button: 'bg-warning-600 hover:bg-warning-700'
  },
  error: {
    iconBg: 'bg-danger-100 dark:bg-danger-900/30',
    iconColor: 'text-danger-600 dark:text-danger-400',
    button: 'bg-danger-600 hover:bg-danger-700'
  },
  info: {
    iconBg: 'bg-info-100 dark:bg-info-900/30',
    iconColor: 'text-info-600 dark:text-info-400',
    button: 'bg-info-600 hover:bg-info-700'
  }
}))

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info
}

const iconComponent = computed(() => iconMap[props.type])
const iconBgClass = computed(() => typeConfig.value[props.type].iconBg)
const iconColorClass = computed(() => typeConfig.value[props.type].iconColor)
const buttonClass = computed(() => typeConfig.value[props.type].button)

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

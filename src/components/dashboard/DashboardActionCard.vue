<template>
  <BaseButton
    variant="card"
    type="button"
    :aria-label="ariaLabel || title"
    class="group w-full flex items-center gap-3 md:gap-4 text-left p-3.5 md:p-4 rounded-xl transition-all duration-200"
    :class="hoverBorderClass"
    @click="$emit('click')"
  >
    <div
      class="p-2.5 md:p-3 rounded-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
      :class="[darkIconBg, darkIconText]"
    >
      <component :is="icon" aria-hidden="true" class="w-5 h-5 md:w-6 md:h-6" />
    </div>

    <div class="flex-1 min-w-0">
      <span
        class="font-semibold text-sm md:text-base transition-colors block"
        :class="titleHoverClass"
      >
        {{ title }}
      </span>
      <span v-if="subtitle" class="text-xs text-page-subtitle mt-0.5 block">
        {{ subtitle }}
      </span>
    </div>

    <ChevronRight aria-hidden="true" class="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
  </BaseButton>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: [Object, Function],
    required: true
  },
  iconBgClass: {
    type: String,
    default: 'bg-primary-50'
  },
  iconTextClass: {
    type: String,
    default: 'text-primary-600'
  },
  hoverBorderClass: {
    type: String,
    default: 'hover:border-primary-100'
  },
  titleHoverClass: {
    type: String,
    default: 'group-hover:text-primary-700'
  },
  ariaLabel: {
    type: String,
    default: ''
  }
})

const iconBgDarkMap = {
  'bg-primary-50': 'bg-primary-50 dark:bg-primary-900/20',
  'bg-secondary-50': 'bg-secondary-50 dark:bg-secondary-900/20',
  'bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-900/20',
  'bg-red-50': 'bg-red-50 dark:bg-red-900/20',
}

const iconTextDarkMap = {
  'text-primary-600': 'text-primary-600 dark:text-primary-400',
  'text-secondary-600': 'text-secondary-600 dark:text-secondary-400',
  'text-emerald-600': 'text-emerald-600 dark:text-emerald-400',
  'text-red-600': 'text-red-600 dark:text-red-400',
}

const darkIconBg = computed(() => iconBgDarkMap[props.iconBgClass] || props.iconBgClass)
const darkIconText = computed(() => iconTextDarkMap[props.iconTextClass] || props.iconTextClass)

defineEmits(['click'])
</script>

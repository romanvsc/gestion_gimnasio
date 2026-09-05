<template>
  <BaseButton
    :variant="featured ? 'primary' : 'card'"
    type="button"
    :aria-label="ariaLabel || title"
    class="group min-h-14 w-full flex items-center gap-3 text-left !rounded-lg !p-3 transition-all duration-200 md:gap-3.5"
    :class="featured ? '!border-primary-600 !shadow-sm' : hoverBorderClass"
    @click="$emit('click')"
  >
    <div
      class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105"
      :class="featured ? 'bg-white/15 text-white' : [darkIconBg, darkIconText]"
    >
      <component :is="icon" aria-hidden="true" class="h-5 w-5" />
    </div>

    <div class="flex-1 min-w-0">
      <span
        class="block text-sm font-semibold transition-colors"
        :class="featured ? 'text-white' : titleHoverClass"
      >
        {{ title }}
      </span>
      <span v-if="subtitle" class="mt-0.5 block text-xs" :class="featured ? 'text-primary-100' : 'text-page-subtitle'">
        {{ subtitle }}
      </span>
    </div>

    <ChevronRight aria-hidden="true" class="h-4 w-4 flex-shrink-0 transition-colors" :class="featured ? 'text-white/70 group-hover:text-white' : 'text-page-muted group-hover:text-page-subtitle'" />
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
  },
  featured: {
    type: Boolean,
    default: false
  }
})

const iconBgDarkMap = {
  'bg-primary-50': 'bg-primary-50 dark:bg-primary-900/20',
  'bg-secondary-50': 'bg-secondary-50 dark:bg-secondary-900/20',
  'bg-success-50': 'bg-success-50 dark:bg-success-900/20',
  'bg-danger-50': 'bg-danger-50 dark:bg-danger-900/20',
  'bg-info-50': 'bg-info-50 dark:bg-info-900/20',
}

const iconTextDarkMap = {
  'text-primary-600': 'text-primary-600 dark:text-primary-400',
  'text-secondary-600': 'text-secondary-600 dark:text-secondary-400',
  'text-success-600': 'text-success-600 dark:text-success-400',
  'text-danger-600': 'text-danger-600 dark:text-danger-400',
  'text-info-600': 'text-info-600 dark:text-info-400',
}

const darkIconBg = computed(() => iconBgDarkMap[props.iconBgClass] || props.iconBgClass)
const darkIconText = computed(() => iconTextDarkMap[props.iconTextClass] || props.iconTextClass)

defineEmits(['click'])
</script>

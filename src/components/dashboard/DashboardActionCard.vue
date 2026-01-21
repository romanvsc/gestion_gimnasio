<template>
  <BaseButton
    variant="card"
    type="button"
    :aria-label="ariaLabel || title"
    class="group w-full flex flex-col items-center justify-center text-center p-4 md:p-6 min-h-[100px] rounded-xl transition-all duration-200"
    :class="hoverBorderClass"
    @click="$emit('click')"
  >
    <div
      class="p-2 md:p-3 rounded-full mb-2 md:mb-3 transition-transform duration-200 group-hover:scale-110"
      :class="[iconBgClass, iconTextClass]"
    >
      <component :is="icon" class="w-5 h-5 md:w-6 md:h-6" />
    </div>

    <span
      class="font-semibold text-sm md:text-base transition-colors"
      :class="titleHoverClass"
    >
      {{ title }}
    </span>

    <span v-if="subtitle" class="text-xs text-gray-400 mt-1 hidden md:block">
      {{ subtitle }}
    </span>
  </BaseButton>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
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

defineEmits(['click'])
</script>

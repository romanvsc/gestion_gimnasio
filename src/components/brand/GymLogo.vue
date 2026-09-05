<template>
  <img
    v-bind="$attrs"
    :src="src || BRAND.logoSrc"
    :alt="alt || BRAND.logoAlt"
  >
</template>

<script setup>
import { BRAND } from '@/config/brand'

defineOptions({ inheritAttrs: false })

defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  }
})
</script>

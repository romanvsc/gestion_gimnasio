<template>
  <svg
    :class="$attrs.class"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.8"
    aria-hidden="true"
    focusable="false"
  >
    <use :href="`${assetBasePath}/${name}.svg?v=2#icon`" />
  </svg>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  name: {
    type: String,
    required: true
  }
})

const assetBasePath = '/brand/navigation'
</script>

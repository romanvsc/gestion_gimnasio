<template>
  <img
    :class="$attrs.class"
    :src="`${assetBasePath}/${name}.svg?v=3`"
    width="32"
    height="32"
    alt=""
    aria-hidden="true"
    draggable="false"
  />
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

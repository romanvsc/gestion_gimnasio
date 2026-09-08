<template>
  <div
    class="flex items-center justify-center text-center text-page-subtitle"
    :class="fullScreen ? 'min-h-screen bg-page-bg' : 'p-8'"
    role="status"
    aria-live="polite"
  >
    <div>
      <div
        class="mx-auto mb-3 animate-spin rounded-full border-4 border-primary-200 border-r-transparent dark:border-primary-900 dark:border-r-primary-500"
        :class="compact ? 'h-7 w-7' : 'h-10 w-10'"
        aria-hidden="true"
      />
      <p :class="compact ? 'text-sm' : 'text-base'">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Cargando información...'
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
})
</script>

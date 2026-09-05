<template>
  <header class="mb-6 flex flex-col gap-4 border-b border-page-border pb-5 lg:flex-row lg:items-center lg:justify-between">
    <div class="min-w-0">
      <p class="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-page-muted">
        Panel de control
      </p>
      <h1 class="text-2xl font-bold tracking-tight text-page-title md:text-3xl">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-1 text-sm text-page-subtitle">
        {{ subtitle }}
      </p>
    </div>

    <div v-if="$slots.actions" class="flex min-w-0 items-center justify-end gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

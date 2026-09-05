<template>
  <BaseModal
    :model-value="visible"
    :title="`Socios con cuota vencida (${members.length})`"
    size="xl"
    header-class="bg-red-50 dark:bg-red-900/20"
    :max-body-height="'calc(100dvh - var(--mobile-nav-height) - 8rem)'"
    @close="$emit('close')"
  >
    <template #icon>
      <AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
    </template>

          <!-- Tarjetas para pantallas compactas -->
          <div class="max-h-[calc(100dvh-var(--mobile-nav-height)-12rem)] space-y-3 overflow-y-auto p-4 xl:hidden">
            <article v-for="member in members" :key="member.id" class="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900 dark:bg-red-900/10">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-semibold text-page-title">{{ member.apellido }}, {{ member.nombre }}</p>
                  <p class="mt-1 text-xs text-page-muted">DNI: {{ member.dni }}</p>
                </div>
                <span class="shrink-0 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">Vencida</span>
              </div>
              <dl class="mt-3 grid grid-cols-1 gap-2 border-t border-red-200 pt-3 text-sm dark:border-red-900 sm:grid-cols-2">
                <div><dt class="text-xs text-page-muted">Email</dt><dd class="break-words text-page-subtitle">{{ member.email || '-' }}</dd></div>
                <div><dt class="text-xs text-page-muted">Teléfono</dt><dd class="text-page-subtitle">{{ member.telefono || '-' }}</dd></div>
                <div><dt class="text-xs text-page-muted">Vencimiento</dt><dd class="font-medium text-red-600">{{ formatDate(member.fecha_fin_cuota) }}</dd></div>
                <div v-if="member.dias_vencido"><dt class="text-xs text-page-muted">Antigüedad</dt><dd class="text-page-subtitle">{{ member.dias_vencido }} días</dd></div>
              </dl>
            </article>
          </div>

          <!-- Tabla -->
          <div class="hidden max-h-96 overflow-x-auto overflow-y-auto px-6 py-4 xl:block">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700/50">
              <thead class="bg-gray-50 dark:bg-white/5 sticky top-0">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">DNI</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Apellido y Nombre</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Teléfono</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vencimiento</th>
                </tr>
              </thead>
              <tbody class="bg-page-card divide-y divide-gray-200 dark:divide-gray-700/50">
                <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td class="px-4 py-3 text-sm text-page-title">{{ member.dni }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-page-title">
                    {{ member.apellido }}, {{ member.nombre }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ member.email || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ member.telefono || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-red-600 font-medium">
                    {{ formatDate(member.fecha_fin_cuota) }}
                    <span v-if="member.dias_vencido" class="text-xs block text-gray-500 dark:text-gray-400">
                      ({{ member.dias_vencido }} días)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

    <template #footer>
      <div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Total: {{ members.length }} socios
            </p>
            <div class="flex w-full gap-3 sm:w-auto">
              <BaseButton variant="secondary" @click="$emit('close')">
                Cerrar
              </BaseButton>
              <BaseButton variant="primary" @click="$emit('export')">
                <Download class="w-4 h-4 mr-2" />
                Exportar Excel
              </BaseButton>
            </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { AlertCircle, Download } from 'lucide-vue-next'
import { formatDate } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  members: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close', 'export'])
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-[100dvh] items-end justify-center px-0 pt-0 pb-0 text-center sm:items-center sm:px-4 sm:pt-4 sm:pb-20 sm:p-0">
        <!-- Overlay -->
        <div 
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="$emit('close')"
        ></div>

        <!-- Modal Panel -->
        <div class="relative inline-block max-h-[calc(100dvh-var(--mobile-nav-height)-0.5rem)] w-full align-bottom overflow-hidden rounded-t-2xl bg-white text-left shadow-xl transform transition-all dark:bg-page-card dark:ring-1 dark:ring-white/10 sm:my-8 sm:max-h-[90vh] sm:align-middle sm:max-w-4xl sm:rounded-lg" role="dialog" aria-modal="true" aria-labelledby="overdue-members-modal-title">
          <!-- Header -->
          <div class="border-b border-red-100 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20 sm:px-6 sm:py-4">
            <div class="flex items-center justify-between">
              <h3 id="overdue-members-modal-title" class="text-lg font-semibold text-red-900 dark:text-red-300 flex items-center gap-2">
                <AlertCircle class="w-5 h-5" />
                Socios con Cuota Vencida ({{ members.length }})
              </h3>
              <button 
                type="button"
                aria-label="Cerrar socios con cuota vencida"
                @click="$emit('close')"
                class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

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

          <!-- Footer -->
          <div class="flex flex-col items-start justify-between gap-3 bg-gray-50 px-4 py-3 dark:bg-white/5 sm:flex-row sm:items-center sm:px-6 sm:py-4">
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
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { AlertCircle, X, Download } from 'lucide-vue-next'
import { formatDate } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'

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

<template>
  <BaseModal
    :model-value="true"
    title="Últimos accesos al gimnasio"
    size="xl"
    :max-body-height="'calc(100dvh - var(--mobile-nav-height) - 5rem)'"
    @close="emit('close')"
  >
    <template #icon>
      <ListChecks class="h-5 w-5 text-primary-600" aria-hidden="true" />
    </template>

    <div v-if="loading" class="py-8 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600 dark:border-gray-700"></div>
      <p class="mt-4 text-page-subtitle">Cargando accesos...</p>
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
    </div>

    <template v-else-if="accesses.length > 0">
      <div class="space-y-3 xl:hidden">
        <article
          v-for="access in accesses"
          :key="access.id"
          class="rounded-xl border border-page-border bg-page-card p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-400/10">
                <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {{ getInitials(access.members?.nombre, access.members?.apellido) }}
                </span>
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-page-title">
                  {{ access.members?.nombre }} {{ access.members?.apellido }}
                </p>
                <p class="text-xs text-page-muted">DNI: {{ access.members?.dni || '-' }}</p>
              </div>
            </div>
            <StatusBadge
              :status="access.acceso_permitido ? 'activo' : 'vencido'"
              :label="access.acceso_permitido ? 'Permitido' : 'Denegado'"
            />
          </div>
          <p class="mt-3 border-t border-page-border pt-3 text-xs text-page-subtitle">
            Fecha y hora: {{ formatDateTime(access.created_at) }}
          </p>
        </article>
      </div>

      <div class="hidden overflow-x-auto xl:block">
        <table class="w-full">
          <thead class="bg-page-card">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-page-muted">Socio</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-page-muted">DNI</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-page-muted">Fecha y hora</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-page-muted">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-page-border">
            <tr v-for="access in accesses" :key="access.id" class="hover:bg-page-card-hover">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-400/10">
                    <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">
                      {{ getInitials(access.members?.nombre, access.members?.apellido) }}
                    </span>
                  </div>
                  <span class="text-sm font-medium text-page-title">
                    {{ access.members?.nombre }} {{ access.members?.apellido }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-page-subtitle">{{ access.members?.dni || '-' }}</td>
              <td class="px-4 py-3 text-sm text-page-subtitle">{{ formatDateTime(access.created_at) }}</td>
              <td class="px-4 py-3">
                <StatusBadge
                  :status="access.acceso_permitido ? 'activo' : 'vencido'"
                  :label="access.acceso_permitido ? 'Permitido' : 'Denegado'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-else class="py-12 text-center">
      <ListChecks class="mx-auto mb-4 h-16 w-16 text-page-muted" aria-hidden="true" />
      <p class="text-page-subtitle">No hay accesos registrados</p>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { ListChecks } from 'lucide-vue-next'
import BaseModal from '@/components/ui/BaseModal.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const emit = defineEmits(['close'])

const accesses = ref([])
const loading = ref(false)
const error = ref(null)

function getInitials(nombre, apellido) {
  const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : ''
  const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : ''
  return firstInitial + lastInitial
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadLastAccesses() {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('attendance')
      .select('*, members(nombre, apellido, dni, foto_url)')
      .order('created_at', { ascending: false })
      .limit(20)

    if (fetchError) {
      console.error('Error en query attendance:', fetchError)
      throw new Error(`Error al consultar accesos: ${fetchError.message}`)
    }

    accesses.value = data || []
  } catch (err) {
    console.error('Error cargando accesos:', err)
    error.value = err.message || 'Error al cargar los accesos'
    accesses.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLastAccesses()
})
</script>

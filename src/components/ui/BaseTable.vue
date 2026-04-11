<template>
  <div class="w-full">
    <!-- Header con título y acciones -->
    <div v-if="title || $slots.actions" class="flex items-center justify-between mb-4">
      <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {{ title }}
      </h3>
      <div v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Contenedor de tabla con scroll -->
    <div class="bg-page-card rounded-xl shadow-sm border border-page-border overflow-hidden">
      
      <!-- Loading state -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent mb-3"></div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">{{ loadingText }}</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!data || data.length === 0" class="p-8 text-center">
        <slot name="empty">
          <div class="flex flex-col items-center">
            <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400 font-medium">{{ emptyText }}</p>
            <p v-if="emptySubtext" class="text-sm text-gray-400 dark:text-gray-500 mt-1">{{ emptySubtext }}</p>
          </div>
        </slot>
      </div>

      <!-- Tabla -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-white/5 border-b border-page-border">
            <tr>
              <th 
                v-for="col in columns" 
                :key="col.key"
                :class="[
                  'px-6 py-4 text-xs font-semibold uppercase tracking-wider',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                  col.sortable ? 'cursor-pointer select-none hover:text-primary-600 dark:hover:text-primary-400 transition-colors' : '',
                  'text-gray-500 dark:text-gray-400'
                ]"
                @click="col.sortable && handleSort(col.key)"
              >
                <span class="inline-flex items-center gap-1">
                  {{ col.label }}
                  <span v-if="col.sortable && sortKey === col.key" class="text-primary-600 dark:text-primary-400">
                    <svg v-if="sortOrder === 'asc'" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr 
              v-for="(row, index) in sortedData" 
              :key="row.id || index"
              class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              :class="[rowClass?.(row, index), clickable ? 'cursor-pointer' : '']"
              @click="clickable && $emit('row-click', row)"
            >
              <td 
                v-for="col in columns" 
                :key="col.key"
                :class="[
                  'px-6 py-4 text-sm',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                  col.class || 'text-gray-600 dark:text-gray-300'
                ]"
              >
                <!-- Slot dinámico por columna -->
                <slot :name="`cell-${col.key}`" :row="row" :value="getNestedValue(row, col.key)" :index="index">
                  {{ col.format ? col.format(getNestedValue(row, col.key), row) : getNestedValue(row, col.key) ?? '—' }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div 
        v-if="$slots.footer && data && data.length > 0" 
        class="px-6 py-4 border-t border-page-border bg-gray-50 dark:bg-white/5"
      >
        <slot name="footer" :total="data.length" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  /** 
   * Columnas de la tabla.
   * Cada columna: { key: string, label: string, sortable?: boolean, align?: 'left'|'center'|'right', format?: Function, class?: string }
   */
  columns: {
    type: Array,
    required: true
  },
  /** Array de objetos (filas) */
  data: {
    type: Array,
    default: () => []
  },
  /** Título opcional encima de la tabla */
  title: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Cargando datos...'
  },
  emptyText: {
    type: String,
    default: 'No se encontraron datos'
  },
  emptySubtext: {
    type: String,
    default: ''
  },
  /** Si las filas son clickeables */
  clickable: {
    type: Boolean,
    default: false
  },
  /** Función para aplicar clases dinámicas a cada fila */
  rowClass: {
    type: Function,
    default: null
  }
})

defineEmits(['row-click'])

// Sorting
const sortKey = ref('')
const sortOrder = ref('asc')

function handleSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const sortedData = computed(() => {
  if (!sortKey.value || !props.data) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = getNestedValue(a, sortKey.value)
    const bVal = getNestedValue(b, sortKey.value)
    
    if (aVal == null) return 1
    if (bVal == null) return -1
    
    let comparison = 0
    if (typeof aVal === 'string') {
      comparison = aVal.localeCompare(bVal, 'es')
    } else {
      comparison = aVal - bVal
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

/** Accede a propiedades anidadas con dot notation (ej: 'member.nombre') */
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}
</script>

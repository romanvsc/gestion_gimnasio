<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Period Buttons -->
    <div class="flex flex-wrap gap-2">
      <BaseButton
        v-for="period in periods"
        :key="period.value"
        :variant="selectedPeriod === period.value ? 'primary' : 'ghost'"
        size="sm"
        @click="selectPeriod(period.value)"
      >
        {{ period.label }}
      </BaseButton>
    </div>
    
    <!-- Custom Date Range Picker with Native Inputs -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div 
        v-if="selectedPeriod === 'custom'" 
        class="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-2"
      >
        <input
          type="date"
          v-model="customStartStr"
          :max="todayStr"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          @change="onCustomRangeChange"
        />
        <span class="text-gray-400">-</span>
        <input
          type="date"
          v-model="customEndStr"
          :min="customStartStr"
          :max="todayStr"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          @change="onCustomRangeChange"
        />
        <BaseButton
          v-if="customStartStr && customEndStr"
          variant="primary"
          size="sm"
          @click="applyCustomRange"
        >
          Aplicar
        </BaseButton>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const emit = defineEmits(['change'])

const props = defineProps({
  selected: {
    type: String,
    default: 'month'
  }
})

const periods = [
  { value: 'day', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
  { value: 'custom', label: 'Personalizado' }
]

const selectedPeriod = ref(props.selected)

// Custom date range using string format for native date inputs
const customStartStr = ref('')
const customEndStr = ref('')

// Today's date as string for max attribute
const todayStr = computed(() => {
  const now = new Date()
  return now.toISOString().split('T')[0]
})

// Calculate date range based on period
function getDateRange(period) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'day':
      return {
        start: today,
        end: now
      }
    case 'week': {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay()) // Start from Sunday
      return {
        start: weekStart,
        end: now
      }
    }
    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        start: monthStart,
        end: now
      }
    }
    case 'year': {
      const yearStart = new Date(now.getFullYear(), 0, 1)
      return {
        start: yearStart,
        end: now
      }
    }
    case 'custom':
      if (customStartStr.value && customEndStr.value) {
        return {
          start: new Date(customStartStr.value),
          end: new Date(customEndStr.value + 'T23:59:59')
        }
      }
      // Default to current month if no custom range
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      }
    default:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      }
  }
}

// Calculate previous period range for comparison
function getPreviousDateRange(period, currentRange) {
  const { start, end } = currentRange
  const duration = end.getTime() - start.getTime()
  
  const previousEnd = new Date(start.getTime() - 1) // Day before current start
  const previousStart = new Date(previousEnd.getTime() - duration)
  
  return {
    start: previousStart,
    end: previousEnd
  }
}

function selectPeriod(period) {
  selectedPeriod.value = period
  
  if (period !== 'custom') {
    emitChange()
  } else {
    // Set default custom range to current month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    customStartStr.value = monthStart.toISOString().split('T')[0]
    customEndStr.value = todayStr.value
  }
}

function onCustomRangeChange() {
  // Validate that end is not before start
  if (customStartStr.value && customEndStr.value) {
    if (new Date(customEndStr.value) < new Date(customStartStr.value)) {
      customEndStr.value = customStartStr.value
    }
  }
}

function applyCustomRange() {
  if (customStartStr.value && customEndStr.value) {
    emitChange()
  }
}

function emitChange() {
  const currentRange = getDateRange(selectedPeriod.value)
  const previousRange = getPreviousDateRange(selectedPeriod.value, currentRange)
  
  emit('change', {
    period: selectedPeriod.value,
    currentRange,
    previousRange,
    periodLabel: getPeriodLabel(selectedPeriod.value)
  })
}

function getPeriodLabel(period) {
  switch (period) {
    case 'day': return 'hoy'
    case 'week': return 'esta semana'
    case 'month': return 'este mes'
    case 'year': return 'este año'
    case 'custom': return 'el periodo'
    default: return 'el periodo'
  }
}

// Watch for external changes to selected prop
watch(() => props.selected, (newVal) => {
  if (newVal !== selectedPeriod.value) {
    selectedPeriod.value = newVal
  }
})

// Emit initial value on mount
onMounted(() => {
  emitChange()
})
</script>


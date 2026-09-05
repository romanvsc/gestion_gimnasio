<template>
  <component
    :is="route ? 'button' : 'div'"
    :type="route ? 'button' : undefined"
    :aria-label="route ? `${title}: abrir detalle` : undefined"
    @click="route && handleClick()"
    :class="[
      'rounded-lg border p-4 transition-colors duration-200 hover:border-page-border md:p-4',
      route ? 'w-full cursor-pointer text-left' : '',
      badgeVariant === 'urgent'
        ? 'border-danger-200 bg-danger-50 hover:border-danger-300 dark:border-danger-800 dark:bg-danger-950/40 dark:hover:border-danger-700'
        : 'border-page-border bg-page-card hover:bg-page-card-hover'
    ]"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p
          class="mb-1 text-[10px] font-bold uppercase tracking-[0.14em]"
          :class="badgeVariant === 'urgent' ? 'text-danger-700 dark:text-danger-300' : 'text-page-subtitle'"
        >{{ title }}</p>
        <p
          class="text-3xl font-extrabold leading-none tracking-tight"
          :class="badgeVariant === 'urgent' ? 'text-danger-950 dark:text-danger-50' : 'text-page-title'"
        >{{ value }}</p>
      </div>
      <div
        :class="[
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md',
          darkIconBgColor
        ]"
      >
        <component
          :is="icon"
          aria-hidden="true"
          :class="['h-4 w-4', darkIconColor]"
        />
      </div>
    </div>

    <span
      v-if="badge"
      :class="[
        'mt-3 inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest',
        badgeClasses
      ]"
    >
      {{ badge }}
    </span>
    
    <!-- Comparison with previous period -->
    <div v-if="showComparison" class="mt-2 flex items-center gap-1.5">
      <component 
        :is="comparisonIcon" 
        aria-hidden="true"
        :class="[
          'w-4 h-4',
          comparisonIsPositive ? 'text-success-600' : 'text-danger-600'
        ]"
      />
      <span 
        :class="[
          'text-sm font-bold',
          comparisonIsPositive ? 'text-success-600' : 'text-danger-600'
        ]"
      >
        {{ formattedComparison }}
      </span>
      <span class="text-xs text-page-muted">{{ comparisonLabel }}</span>
    </div>
    
    <!-- Legacy trend support -->
    <div v-else-if="trend" class="mt-2 flex items-center gap-1">
      <span 
        :class="[
          'text-sm font-bold',
          trendIsPositive ? 'text-success-600' : 'text-danger-600'
        ]"
      >
        {{ trend }}
      </span>
      <span class="text-xs text-page-muted">vs mes anterior</span>
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  // New comparison props
  comparison: {
    type: Number,
    default: null
  },
  comparisonLabel: {
    type: String,
    default: 'vs periodo anterior'
  },
  // Legacy trend prop (for backwards compatibility)
  trend: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    required: true
  },
  route: {
    type: String,
    default: ''
  },
  iconBgColor: {
    type: String,
    default: 'bg-primary-50'
  },
  iconColor: {
    type: String,
    default: 'text-primary-600'
  },
  badge: {
    type: String,
    default: ''
  },
  badgeVariant: {
    type: String,
    default: 'default' // 'default' | 'live' | 'urgent'
  }
})

const router = useRouter()

// Auto-map light icon bg/color to include dark equivalents
const iconBgDarkMap = {
  'bg-primary-50': 'bg-primary-50 dark:bg-primary-900/20',
  'bg-secondary-50': 'bg-secondary-50 dark:bg-secondary-900/20',
  'bg-success-50': 'bg-success-50 dark:bg-success-900/20',
  'bg-danger-50': 'bg-danger-50 dark:bg-danger-900/20',
  'bg-info-50': 'bg-info-50 dark:bg-info-900/20',
  'bg-warning-50': 'bg-warning-50 dark:bg-warning-900/20',
}

const iconColorDarkMap = {
  'text-primary-600': 'text-primary-600 dark:text-primary-400',
  'text-secondary-600': 'text-secondary-600 dark:text-secondary-400',
  'text-success-600': 'text-success-600 dark:text-success-400',
  'text-danger-600': 'text-danger-600 dark:text-danger-400',
  'text-info-600': 'text-info-600 dark:text-info-400',
  'text-warning-600': 'text-warning-600 dark:text-warning-400',
}

const darkIconBgColor = computed(() => iconBgDarkMap[props.iconBgColor] || props.iconBgColor)
const darkIconColor = computed(() => iconColorDarkMap[props.iconColor] || props.iconColor)

// Badge variant classes
const badgeClasses = computed(() => {
  const map = {
    default: 'border border-primary-200 bg-primary-100 text-primary-800 dark:border-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    live: 'border border-success-200 bg-success-100 text-success-800 dark:border-success-700 dark:bg-success-900/40 dark:text-success-300',
    urgent: 'border border-danger-200 bg-danger-100 text-danger-800 dark:border-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
  }
  return map[props.badgeVariant] || map.default
})

// Comparison computed properties
const showComparison = computed(() => {
  return props.comparison !== null && props.comparison !== undefined
})

const comparisonIsPositive = computed(() => {
  return props.comparison > 0
})

const comparisonIcon = computed(() => {
  if (props.comparison > 0) return TrendingUp
  if (props.comparison < 0) return TrendingDown
  return Minus
})

const formattedComparison = computed(() => {
  if (props.comparison === 0) return '0%'
  const sign = props.comparison > 0 ? '+' : ''
  return `${sign}${props.comparison}%`
})

// Legacy trend computed
const trendIsPositive = computed(() => {
  return props.trend.startsWith('+')
})

function handleClick() {
  if (props.route) {
    router.push(props.route)
  }
}
</script>


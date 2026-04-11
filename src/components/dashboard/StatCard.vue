<template>
  <div 
    @click="handleClick"
    :class="[
      'rounded-xl border p-5 md:p-6 transition-all duration-200 hover:shadow-md',
      route ? 'cursor-pointer' : '',
      badgeVariant === 'urgent'
        ? 'bg-red-950/40 border-red-500/30 hover:border-red-500/50'
        : 'bg-page-card border-page-border hover:bg-page-card-hover'
    ]"
  >
    <div class="flex items-start justify-between mb-4">
      <div 
        :class="[
          'p-3 rounded-xl',
          darkIconBgColor
        ]"
      >
        <component 
          :is="icon" 
          :class="[
            'w-6 h-6',
            darkIconColor
          ]"
        />
      </div>
      <span 
        v-if="badge"
        :class="[
          'text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md',
          badgeClasses
        ]"
      >
        {{ badge }}
      </span>
    </div>

    <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">{{ title }}</p>
    <p class="text-page-title text-3xl md:text-4xl font-extrabold tracking-tight">{{ value }}</p>
    
    <!-- Comparison with previous period -->
    <div v-if="showComparison" class="flex items-center gap-1.5 mt-2">
      <component 
        :is="comparisonIcon" 
        :class="[
          'w-4 h-4',
          comparisonIsPositive ? 'text-emerald-500' : 'text-red-500'
        ]"
      />
      <span 
        :class="[
          'text-sm font-bold',
          comparisonIsPositive ? 'text-emerald-500' : 'text-red-500'
        ]"
      >
        {{ formattedComparison }}
      </span>
      <span class="text-gray-500 text-xs">{{ comparisonLabel }}</span>
    </div>
    
    <!-- Legacy trend support -->
    <div v-else-if="trend" class="flex items-center gap-1 mt-2">
      <span 
        :class="[
          'text-sm font-bold',
          trendIsPositive ? 'text-emerald-500' : 'text-red-500'
        ]"
      >
        {{ trend }}
      </span>
      <span class="text-gray-500 text-xs">vs mes anterior</span>
    </div>
  </div>
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
  'bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-900/20',
  'bg-red-50': 'bg-red-50 dark:bg-red-900/20',
  'bg-blue-50': 'bg-blue-50 dark:bg-blue-900/20',
  'bg-amber-50': 'bg-amber-50 dark:bg-amber-900/20',
}

const iconColorDarkMap = {
  'text-primary-600': 'text-primary-600 dark:text-primary-400',
  'text-secondary-600': 'text-secondary-600 dark:text-secondary-400',
  'text-emerald-600': 'text-emerald-600 dark:text-emerald-400',
  'text-red-600': 'text-red-600 dark:text-red-400',
  'text-blue-600': 'text-blue-600 dark:text-blue-400',
  'text-amber-600': 'text-amber-600 dark:text-amber-400',
}

const darkIconBgColor = computed(() => iconBgDarkMap[props.iconBgColor] || props.iconBgColor)
const darkIconColor = computed(() => iconColorDarkMap[props.iconColor] || props.iconColor)

// Badge variant classes
const badgeClasses = computed(() => {
  const map = {
    default: 'bg-primary-400/10 text-primary-400 border border-primary-400/20',
    live: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    urgent: 'bg-red-400/15 text-red-400 border border-red-400/20',
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


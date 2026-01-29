<template>
  <div 
    @click="handleClick"
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-100"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-gray-400 text-sm font-medium mb-2">{{ title }}</p>
        <p class="text-gray-800 text-3xl font-bold mb-1">{{ value }}</p>
        
        <!-- Comparison with previous period -->
        <div v-if="showComparison" class="flex items-center gap-1.5 mt-1">
          <component 
            :is="comparisonIcon" 
            :class="[
              'w-4 h-4',
              comparisonIsPositive ? 'text-emerald-600' : 'text-red-600'
            ]"
          />
          <span 
            :class="[
              'text-sm font-semibold',
              comparisonIsPositive ? 'text-emerald-600' : 'text-red-600'
            ]"
          >
            {{ formattedComparison }}
          </span>
          <span class="text-gray-400 text-xs">{{ comparisonLabel }}</span>
        </div>
        
        <!-- Legacy trend support -->
        <div v-else-if="trend" class="flex items-center gap-1">
          <span 
            :class="[
              'text-sm font-semibold',
              trendIsPositive ? 'text-emerald-600' : 'text-red-600'
            ]"
          >
            {{ trend }}
          </span>
          <span class="text-gray-400 text-xs">vs mes anterior</span>
        </div>
      </div>
      
      <div 
        :class="[
          'p-3 rounded-lg',
          iconBgColor || 'bg-primary-50'
        ]"
      >
        <component 
          :is="icon" 
          :class="[
            'w-6 h-6',
            iconColor || 'text-primary-600'
          ]"
        />
      </div>
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
  }
})

const router = useRouter()

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


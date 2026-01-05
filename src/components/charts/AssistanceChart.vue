<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Asistencia Semanal</h3>
    
    <!-- Gráfico simple con barras CSS -->
    <div class="space-y-3">
      <div v-for="day in weekData" :key="day.day" class="flex items-center">
        <div class="w-20 text-sm text-gray-600">{{ day.day }}</div>
        <div class="flex-1 bg-gray-100 rounded-full h-8 relative">
          <div 
            class="bg-primary-500 h-full rounded-full flex items-center justify-end pr-2"
            :style="{ width: `${(day.count / maxCount) * 100}%` }"
          >
            <span class="text-white text-xs font-medium">{{ day.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 text-sm text-gray-500 text-center">
      Total semanal: {{ totalWeek }} visitas
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const weekData = ref([
  { day: 'Lun', count: 0 },
  { day: 'Mar', count: 0 },
  { day: 'Mié', count: 0 },
  { day: 'Jue', count: 0 },
  { day: 'Vie', count: 0 },
  { day: 'Sáb', count: 0 },
  { day: 'Dom', count: 0 }
])

const maxCount = computed(() => {
  return Math.max(...weekData.value.map(d => d.count), 1)
})

const totalWeek = computed(() => {
  return weekData.value.reduce((sum, d) => sum + d.count, 0)
})

async function loadWeekData() {
  try {
    // Obtener datos de los últimos 7 días
    const today = new Date()
    const lastWeek = new Date(today)
    lastWeek.setDate(today.getDate() - 6)

    const { data } = await supabase
      .from('attendance')
      .select('created_at')
      .gte('created_at', lastWeek.toISOString())

    if (data) {
      // Contar por día
      const counts = [0, 0, 0, 0, 0, 0, 0]
      data.forEach(item => {
        const date = new Date(item.created_at)
        const dayIndex = (date.getDay() + 6) % 7 // Ajustar para que Lun=0
        counts[dayIndex]++
      })

      weekData.value = weekData.value.map((day, index) => ({
        ...day,
        count: counts[index]
      }))
    }
  } catch (error) {
    console.error('Error cargando datos de asistencia:', error)
  }
}

onMounted(() => {
  loadWeekData()
})
</script>
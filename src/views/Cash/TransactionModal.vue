<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Registrar Movimiento</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Tipo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tipo <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              @click="handleTipoChange('INGRESO')"
              :class="[
                'p-4 rounded-lg border-2 font-semibold transition-all',
                formData.tipo === 'INGRESO'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              ]"
            >
              <ArrowDownCircle class="w-6 h-6 mx-auto mb-2" />
              Ingreso
            </button>
            <button
              type="button"
              @click="handleTipoChange('EGRESO')"
              :class="[
                'p-4 rounded-lg border-2 font-semibold transition-all',
                formData.tipo === 'EGRESO'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              ]"
            >
              <ArrowUpCircle class="w-6 h-6 mx-auto mb-2" />
              Egreso
            </button>
          </div>
        </div>

        <!-- Categoría (Dinámico) -->
        <div>
          <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1">
            Categoría <span class="text-red-500">*</span>
          </label>
          <select
            id="categoria"
            v-model="formData.categoria"
            required
            :disabled="!formData.tipo"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">{{ formData.tipo ? 'Seleccionar...' : 'Primero selecciona un tipo' }}</option>
            <option v-for="concept in filteredConcepts" :key="concept.id" :value="concept.nombre">
              {{ concept.nombre }}
            </option>
          </select>
        </div>

        <!-- Monto -->
        <BaseInput
          v-model="formData.monto"
          type="number"
          label="Monto"
          placeholder="0.00"
          required
          :min="0"
          step="0.01"
        />

        <!-- Descripción -->
        <div>
          <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            v-model="formData.descripcion"
            rows="3"
            placeholder="Detalle opcional del movimiento..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <!-- Botones -->
        <div class="flex gap-3 pt-4">
          <BaseButton
            type="button"
            variant="secondary"
            full-width
            @click="$emit('close')"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            full-width
            :disabled="!isFormValid"
          >
            Guardar
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useParameters } from '@/composables/useParameters'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-vue-next'

const emit = defineEmits(['close', 'submit'])

const { getConceptsByType, fetchParameters } = useParameters()

const formData = ref({
  tipo: 'INGRESO',
  categoria: '',
  descripcion: '',
  monto: ''
})

// Conceptos filtrados según el tipo seleccionado
const filteredConcepts = computed(() => {
  return getConceptsByType(formData.value.tipo)
})

const isFormValid = computed(() => {
  return formData.value.tipo &&
         formData.value.categoria &&
         formData.value.monto > 0
})

// Cuando cambia el tipo, resetear la categoría seleccionada
function handleTipoChange(newTipo) {
  formData.value.tipo = newTipo
  formData.value.categoria = '' // Reset categoría al cambiar tipo
}

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', { ...formData.value })
  }
}

onMounted(async () => {
  await fetchParameters()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-page-title">
              {{ isEditing ? 'Editar Plan' : 'Nuevo Plan' }}
            </h3>
            <button 
              @click="handleClose"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
            >
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            <!-- Nombre -->
            <BaseInput
              v-model="form.nombre"
              label="Nombre del plan"
              placeholder="Ej: Mensual, Trimestral..."
              size="lg"
              required
            />

            <!-- Duración -->
            <BaseInput
              v-model.number="form.dias_duracion"
              label="Duración (días)"
              type="number"
              placeholder="30"
              size="lg"
              required
            />

            <!-- Precio Regular -->
            <BaseInput
              v-model.number="form.precio"
              label="Precio regular"
              type="number"
              placeholder="5000"
              size="lg"
              required
            >
              <template #prefix>
                <span class="text-gray-500">$</span>
              </template>
            </BaseInput>

            <!-- Precio Socio -->
            <BaseInput
              v-model.number="form.precio_socio"
              label="Precio socio (opcional)"
              type="number"
              placeholder="4500"
              size="lg"
            >
              <template #prefix>
                <span class="text-gray-500">$</span>
              </template>
            </BaseInput>

            <!-- Estado Activo -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p class="font-medium text-page-title">Plan activo</p>
                <p class="text-sm text-page-subtitle">Los planes inactivos no aparecen al registrar pagos</p>
              </div>
              <button
                type="button"
                @click="form.activo = !form.activo"
                class="relative w-14 h-8 rounded-full transition-colors duration-200 touch-manipulation"
                :class="form.activo ? 'bg-emerald-500' : 'bg-gray-300'"
              >
                <span 
                  class="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200"
                  :class="form.activo ? 'left-7' : 'left-1'"
                />
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-gray-100 flex gap-3">
            <BaseButton 
              variant="ghost" 
              class="flex-1"
              size="lg"
              @click="handleClose"
            >
              Cancelar
            </BaseButton>
            <BaseButton 
              variant="primary" 
              class="flex-1"
              size="lg"
              :loading="saving"
              @click="handleSave"
            >
              {{ isEditing ? 'Guardar cambios' : 'Crear plan' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { toast } from 'vue-sonner'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  plan: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)

const defaultForm = {
  nombre: '',
  dias_duracion: 30,
  precio: null,
  precio_socio: null,
  activo: true
}

const form = ref({ ...defaultForm })

const isEditing = computed(() => !!props.plan?.id)

// Reset form when modal opens/closes or plan changes
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.plan) {
      form.value = {
        nombre: props.plan.nombre || '',
        dias_duracion: props.plan.dias_duracion || 30,
        precio: props.plan.precio || null,
        precio_socio: props.plan.precio_socio || null,
        activo: props.plan.activo !== false
      }
    } else {
      form.value = { ...defaultForm }
    }
  }
})

function handleClose() {
  emit('close')
}

async function handleSave() {
  // Validación
  if (!form.value.nombre?.trim()) {
    toast.error('Ingresa un nombre para el plan')
    return
  }
  if (!form.value.dias_duracion || form.value.dias_duracion < 1) {
    toast.error('Ingresa una duración válida')
    return
  }
  if (!form.value.precio || form.value.precio < 0) {
    toast.error('Ingresa un precio válido')
    return
  }

  saving.value = true

  try {
    emit('save', {
      id: props.plan?.id,
      ...form.value
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative {
  transform: translateY(100%);
}

.modal-leave-to .relative {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .relative {
    transform: scale(0.95) translateY(10px);
  }
  
  .modal-leave-to .relative {
    transform: scale(0.95) translateY(10px);
  }
}
</style>

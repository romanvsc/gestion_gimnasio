<template>
  <div class="bg-page-bg min-h-screen pb-24 md:pb-8">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center gap-3">
          <button 
            @click="router.push({ name: 'Dashboard' })"
            class="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors touch-manipulation"
          >
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 class="text-xl font-bold text-page-title">Configuración</h1>
            <p class="text-sm text-page-subtitle">Personaliza tu gimnasio</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent mb-4"></div>
        <p class="text-page-subtitle">Cargando configuración...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      <!-- SECCIÓN 1: Identidad Visual -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <ImageIcon class="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 class="font-semibold text-page-title">Identidad Visual</h2>
            <p class="text-sm text-page-subtitle">Logo de tu gimnasio</p>
          </div>
        </div>
        
        <div class="p-4">
          <div class="flex items-center gap-4">
            <!-- Logo Preview -->
            <div 
              class="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50"
              :class="{ 'border-solid border-gray-200': formData.logo_url }"
            >
              <img 
                v-if="formData.logo_url" 
                :src="formData.logo_url" 
                :alt="formData.nombre_gimnasio"
                class="w-full h-full object-contain p-2"
              >
              <Building2 v-else class="w-10 h-10 text-gray-300" />
            </div>

            <!-- Actions -->
            <div class="flex-1 space-y-2">
              <label
                class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors touch-manipulation"
              >
                <Upload class="w-4 h-4" />
                <span>{{ formData.logo_url ? 'Cambiar' : 'Subir' }} Logo</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  @change="handleLogoUpload"
                  class="hidden"
                  :disabled="uploadingLogo"
                >
              </label>
              
              <button
                v-if="formData.logo_url"
                type="button"
                @click="handleDeleteLogo"
                class="flex items-center gap-2 px-4 py-2.5 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors touch-manipulation"
              >
                <Trash2 class="w-4 h-4" />
                Eliminar
              </button>
              
              <p v-if="uploadingLogo" class="text-sm text-primary-600 flex items-center gap-2">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"></div>
                Subiendo...
              </p>
            </div>
          </div>
          <p class="text-xs text-page-muted mt-3">JPG, PNG o WEBP. Máximo 5MB.</p>
        </div>
      </section>

      <!-- SECCIÓN 2: Información del Gimnasio -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center">
            <Building2 class="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <h2 class="font-semibold text-page-title">Información del Gimnasio</h2>
            <p class="text-sm text-page-subtitle">Datos de contacto</p>
          </div>
        </div>
        
        <div class="p-4 space-y-4">
          <BaseInput
            v-model="formData.nombre_gimnasio"
            label="Nombre del gimnasio"
            placeholder="Ej: Gimnasio FitZone"
            size="lg"
            required
          />
          
          <BaseInput
            v-model="formData.email_contacto"
            label="Email de contacto"
            type="email"
            placeholder="contacto@gimnasio.com"
            size="lg"
          />
          
          <BaseInput
            v-model="formData.whatsapp"
            label="WhatsApp"
            type="tel"
            placeholder="+54 9 11 1234-5678"
            size="lg"
          />
          
          <BaseInput
            v-model="formData.direccion"
            label="Dirección"
            placeholder="Av. Siempre Viva 742"
            size="lg"
          />
        </div>
      </section>

      <!-- SECCIÓN 3: Horarios -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock class="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 class="font-semibold text-page-title">Horarios de Apertura</h2>
            <p class="text-sm text-page-subtitle">Cuándo está abierto el gimnasio</p>
          </div>
        </div>
        
        <div class="p-4">
          <textarea
            v-model="formData.horarios_apertura"
            rows="4"
            placeholder="Lunes a Viernes: 6:00 - 22:00&#10;Sábados: 8:00 - 20:00&#10;Domingos: 9:00 - 14:00"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-base"
            maxlength="500"
          ></textarea>
        </div>
      </section>

      <!-- SECCIÓN 4: Planes -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CreditCard class="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 class="font-semibold text-page-title">Planes y Precios</h2>
              <p class="text-sm text-page-subtitle">Membresías disponibles</p>
            </div>
          </div>
          <BaseButton 
            variant="primary" 
            size="sm"
            @click="openPlanModal(null)"
          >
            <Plus class="w-4 h-4 mr-1" />
            Nuevo
          </BaseButton>
        </div>
        
        <div class="divide-y divide-gray-100">
          <!-- Empty State -->
          <div v-if="!plans.length" class="p-8 text-center">
            <CreditCard class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-page-subtitle">No hay planes configurados</p>
            <p class="text-sm text-page-muted">Crea tu primer plan para comenzar</p>
          </div>
          
          <!-- Plan Items -->
          <div 
            v-for="plan in plans" 
            :key="plan.id"
            class="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="plan.activo ? 'bg-emerald-100' : 'bg-gray-100'"
              >
                <CreditCard 
                  class="w-5 h-5" 
                  :class="plan.activo ? 'text-emerald-600' : 'text-gray-400'" 
                />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-medium text-page-title" :class="{ 'text-gray-400': !plan.activo }">
                    {{ plan.nombre }}
                  </p>
                  <span 
                    v-if="!plan.activo"
                    class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500"
                  >
                    Inactivo
                  </span>
                </div>
                <p class="text-sm text-page-subtitle">
                  {{ plan.dias_duracion }} días · 
                  <span class="font-medium text-emerald-600">${{ formatPrice(plan.precio) }}</span>
                  <span v-if="plan.precio_socio" class="text-page-muted">
                    · Socio: ${{ formatPrice(plan.precio_socio) }}
                  </span>
                </p>
              </div>
            </div>
            
            <button 
              @click="openPlanModal(plan)"
              class="p-2 rounded-xl hover:bg-gray-100 transition-colors touch-manipulation"
            >
              <Pencil class="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      <!-- SECCIÓN 5: Métodos de Pago -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Wallet class="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 class="font-semibold text-page-title">Métodos de Pago</h2>
            <p class="text-sm text-page-subtitle">Formas de pago aceptadas</p>
          </div>
        </div>
        
        <div class="p-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="method in paymentMethods"
              :key="method.id"
              @click="togglePaymentMethod(method)"
              class="px-4 py-2.5 rounded-xl font-medium text-sm transition-all touch-manipulation"
              :class="method.activo 
                ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
            >
              <span class="flex items-center gap-2">
                <Check v-if="method.activo" class="w-4 h-4" />
                {{ method.nombre }}
              </span>
            </button>
          </div>
          <p class="text-xs text-page-muted mt-3">
            Toca para activar o desactivar cada método
          </p>
        </div>
      </section>

      <!-- Botón Guardar (Flotante en móvil) -->
      <div class="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-page-bg via-page-bg to-transparent md:relative md:bottom-auto md:p-0 md:bg-transparent">
        <BaseButton
          variant="primary"
          size="lg"
          class="w-full"
          :loading="saving"
          @click="handleSave"
        >
          <Save class="w-5 h-5 mr-2" />
          Guardar Cambios
        </BaseButton>
      </div>
    </div>

    <!-- Plan Modal -->
    <PlanModal
      :show="showPlanModal"
      :plan="selectedPlan"
      @close="closePlanModal"
      @save="handleSavePlan"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useSettings } from '@/composables/useSettings'
import { useParameters } from '@/composables/useParameters'
import { confirmAlert } from '@/lib/alerts'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PlanModal from '@/components/settings/PlanModal.vue'
import { 
  ArrowLeft, 
  ImageIcon, 
  Building2, 
  Upload, 
  Trash2, 
  Clock, 
  CreditCard, 
  Plus, 
  Pencil, 
  Wallet, 
  Check,
  Save 
} from 'lucide-vue-next'

const router = useRouter()
const { settings, loading, fetchSettings, updateSettings, uploadLogo, deleteLogo } = useSettings()
const { 
  plans, 
  paymentMethods, 
  fetchAllPlans, 
  fetchAllPaymentMethods, 
  createPlan, 
  updatePlan, 
  updatePaymentMethod 
} = useParameters()

// Form state
const formData = reactive({
  nombre_gimnasio: '',
  email_contacto: '',
  whatsapp: '',
  direccion: '',
  horarios_apertura: '',
  logo_url: null
})

const saving = ref(false)
const uploadingLogo = ref(false)

// Plan modal state
const showPlanModal = ref(false)
const selectedPlan = ref(null)

// ==================
// LIFECYCLE
// ==================
onMounted(async () => {
  await Promise.all([
    fetchSettings(),
    fetchAllPlans(),
    fetchAllPaymentMethods()
  ])
  
  // Copiar datos al formulario
  Object.assign(formData, {
    nombre_gimnasio: settings.nombre_gimnasio || '',
    email_contacto: settings.email_contacto || '',
    whatsapp: settings.whatsapp || '',
    direccion: settings.direccion || '',
    horarios_apertura: settings.horarios_apertura || '',
    logo_url: settings.logo_url || null
  })
})

// ==================
// LOGO HANDLERS
// ==================
async function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    toast.error('El logo no debe superar 5MB')
    event.target.value = ''
    return
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!validTypes.includes(file.type)) {
    toast.error('Formato no válido. Usa JPG, PNG o WEBP')
    event.target.value = ''
    return
  }

  uploadingLogo.value = true

  try {
    await toast.promise(
      uploadLogo(file),
      {
        loading: 'Subiendo logo...',
        success: 'Logo actualizado',
        error: 'Error al subir el logo'
      }
    )
    formData.logo_url = settings.logo_url
  } catch (err) {
    console.error('Error al subir logo:', err)
  } finally {
    uploadingLogo.value = false
    event.target.value = ''
  }
}

async function handleDeleteLogo() {
  const confirmed = await confirmAlert(
    'Eliminar Logo',
    '¿Estás seguro de que deseas eliminar el logo actual?'
  )
  if (!confirmed) return

  try {
    await toast.promise(
      deleteLogo(),
      {
        loading: 'Eliminando logo...',
        success: 'Logo eliminado',
        error: 'Error al eliminar el logo'
      }
    )
    formData.logo_url = null
  } catch (err) {
    console.error('Error al eliminar logo:', err)
  }
}

// ==================
// PLAN HANDLERS
// ==================
function openPlanModal(plan) {
  selectedPlan.value = plan
  showPlanModal.value = true
}

function closePlanModal() {
  showPlanModal.value = false
  selectedPlan.value = null
}

async function handleSavePlan(planData) {
  try {
    if (planData.id) {
      // Actualizar plan existente
      const result = await updatePlan(planData.id, {
        nombre: planData.nombre,
        dias_duracion: planData.dias_duracion,
        precio: planData.precio,
        precio_socio: planData.precio_socio,
        activo: planData.activo
      })
      
      if (result.success) {
        toast.success('Plan actualizado')
        await fetchAllPlans()
      } else {
        toast.error(result.error || 'Error al actualizar')
      }
    } else {
      // Crear nuevo plan
      const result = await createPlan({
        nombre: planData.nombre,
        dias_duracion: planData.dias_duracion,
        precio: planData.precio,
        precio_socio: planData.precio_socio,
        activo: planData.activo
      })
      
      if (result.success) {
        toast.success('Plan creado')
        await fetchAllPlans()
      } else {
        toast.error(result.error || 'Error al crear')
      }
    }
    
    closePlanModal()
  } catch (err) {
    console.error('Error guardando plan:', err)
    toast.error('Error inesperado')
  }
}

// ==================
// PAYMENT METHOD HANDLERS
// ==================
async function togglePaymentMethod(method) {
  try {
    const result = await updatePaymentMethod(method.id, {
      activo: !method.activo
    })
    
    if (result.success) {
      await fetchAllPaymentMethods()
      toast.success(method.activo ? 'Método desactivado' : 'Método activado')
    } else {
      toast.error('Error al actualizar')
    }
  } catch (err) {
    console.error('Error:', err)
    toast.error('Error inesperado')
  }
}

// ==================
// SAVE SETTINGS
// ==================
async function handleSave() {
  if (!formData.nombre_gimnasio?.trim()) {
    toast.error('Ingresa el nombre del gimnasio')
    return
  }

  saving.value = true

  try {
    await toast.promise(
      updateSettings({
        nombre_gimnasio: formData.nombre_gimnasio.trim(),
        email_contacto: formData.email_contacto?.trim() || '',
        whatsapp: formData.whatsapp?.trim() || '',
        direccion: formData.direccion?.trim() || '',
        horarios_apertura: formData.horarios_apertura?.trim() || ''
      }),
      {
        loading: 'Guardando...',
        success: 'Configuración guardada',
        error: 'Error al guardar'
      }
    )
  } catch (err) {
    console.error('Error al guardar:', err)
  } finally {
    saving.value = false
  }
}

// ==================
// UTILS
// ==================
function formatPrice(price) {
  if (!price) return '0'
  return new Intl.NumberFormat('es-AR').format(price)
}
</script>

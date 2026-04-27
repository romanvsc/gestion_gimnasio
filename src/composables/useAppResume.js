import { watch, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { toast } from 'vue-sonner'

/**
 * Registra un callback que se ejecuta cuando la app vuelve a foreground.
 * Usa el ref reactivo lastResumeAt del userStore — sin eventos DOM, sin listeners manuales.
 * El watcher de Vue garantiza la entrega sin importar el orden de montaje.
 */
export function useAppResume(callback, options = {}) {
  const { minIntervalMs = 1200, showToast = false } = options
  const userStore = useUserStore()

  let inFlight = false
  let lastHandledAt = 0

  const stopWatch = watch(
    () => userStore.lastResumeAt,
    async (newVal) => {
      if (!newVal) return
      if (newVal - lastHandledAt < minIntervalMs) return
      if (inFlight) return

      lastHandledAt = newVal
      inFlight = true

      if (showToast) {
        toast.info('Sincronizando datos...', { duration: 2000 })
      }

      try {
        await callback()
      } catch (err) {
        console.error('Error en callback de reanudacion de app:', err)
      } finally {
        inFlight = false
      }
    }
  )

  onUnmounted(() => {
    stopWatch()
  })
}

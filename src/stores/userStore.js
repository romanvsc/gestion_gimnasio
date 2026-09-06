import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import { reportClientError } from '@/lib/observability'

export const useUserStore = defineStore('user', () => {
  const AUTH_BOOT_TIMEOUT_MS = 10000
  const LOGIN_TIMEOUT_MS = 10000
  const ROLE_CHECK_TIMEOUT_MS = 8000

  function withTimeout(promise, timeoutMs, message) {
    let timeoutId
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs)
    })

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
  }

  // Estado
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const userRole = ref(null) // 'admin', 'staff', 'recepcion' o null
  const initialized = ref(false)
  let authSubscription = null
  let roleRequestId = 0
  let initSessionPromise = null

  // Timestamp reactivo para señalizar que la app volvió al frente
  const lastResumeAt = ref(0)

  function triggerResume() {
    lastResumeAt.value = Date.now()
  }

  // Computed
  const isAuthenticated = computed(() => !!session.value)
  const userEmail = computed(() => user.value?.email || '')
  const isAdmin = computed(() => userRole.value === 'admin')
  const isStaff = computed(() => ['admin', 'staff', 'recepcion'].includes(userRole.value))

  // Acciones

  /**
   * Verifica el rol del usuario en la tabla staff
   */
  async function checkUserRole(userId) {
    const requestId = ++roleRequestId

    try {
      const { data: staffData } = await supabase
        .from('staff')
        .select('rol')
        .eq('id', userId)
        .single()

      if (requestId !== roleRequestId) return

      if (staffData?.rol) {
        userRole.value = staffData.rol
      } else {
        userRole.value = null
      }
    } catch (err) {
      if (requestId !== roleRequestId) return
      reportClientError('auth.role_check', err)
      userRole.value = null
    }
  }

  /**
   * Inicializa la sesión desde Supabase
   * Se llama al cargar la app para restaurar la sesión
   */
  async function initializeSession() {
    try {
      loading.value = true
      error.value = null

      const { data, error: sessionError } = await withTimeout(
        supabase.auth.getSession(),
        AUTH_BOOT_TIMEOUT_MS,
        'No se pudo verificar la sesión a tiempo. Revisá la conexión e intentá nuevamente.'
      )

      if (sessionError) {
        reportClientError('auth.session_restore', sessionError)
        // Resetear todo si hay error
        session.value = null
        user.value = null
        userRole.value = null
        return
      }

      const currentSession = data?.session

      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
        // Verificar el rol del usuario
        await withTimeout(
          checkUserRole(currentSession.user.id),
          ROLE_CHECK_TIMEOUT_MS,
          'No se pudo verificar el rol del usuario a tiempo.'
        )
      } else {
        // No hay sesión, resetear todo
        session.value = null
        user.value = null
        userRole.value = null
      }

      // Escuchar cambios de auth una sola vez para evitar listeners duplicados.
      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          session.value = newSession
          user.value = newSession?.user || null

          if (newSession?.user) {
            await checkUserRole(newSession.user.id)
          } else {
            userRole.value = null
          }

          // Si el token se refrescó, actualizar la sesión
          // Si la sesión expiró, limpiar todo
          if (event === 'SIGNED_OUT') {
            session.value = null
            user.value = null
            userRole.value = null
          }
        })

        authSubscription = data?.subscription || null
      }
    } catch (err) {
      reportClientError('auth.session_init', err)
      roleRequestId += 1
      error.value = err.message
      // IMPORTANTE: Resetear todo en caso de error crítico
      session.value = null
      user.value = null
      userRole.value = null
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  /**
   * Comparte una unica inicializacion entre App y el guard del router.
   * Asi la navegacion inicial no queda bloqueada por una segunda consulta
   * directa a Supabase sin timeout.
   */
  async function initSession() {
    if (initSessionPromise) return initSessionPromise
    if (initialized.value) {
      return { success: true, data: { session: session.value } }
    }

    initSessionPromise = initializeSession()

    try {
      return await initSessionPromise
    } finally {
      initSessionPromise = null
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async function login(email, password) {
    try {
      loading.value = true
      error.value = null

      const { data, error: loginError } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        LOGIN_TIMEOUT_MS,
        'El inicio de sesión tardó demasiado en responder. Revisá la conexión e intentá nuevamente.'
      )

      if (loginError) throw loginError

      session.value = data.session
      user.value = data.user

      // Verificar el rol del usuario después del login
      await withTimeout(
        checkUserRole(data.user.id),
        ROLE_CHECK_TIMEOUT_MS,
        'No se pudo verificar el rol del usuario a tiempo.'
      )

      return { success: true }
    } catch (err) {
      reportClientError('auth.login', err)
      error.value = err.message
      toast.error('Error al iniciar sesión: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async function logout() {
    try {
      loading.value = true
      error.value = null

      const { error: logoutError } = await supabase.auth.signOut()
      if (logoutError) throw logoutError

      session.value = null
      user.value = null
      userRole.value = null

      return { success: true }
    } catch (err) {
      reportClientError('auth.logout', err)
      error.value = err.message
      toast.error('Error al cerrar sesión: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async function register(email, password) {
    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })

      if (signUpError) throw signUpError

      return { success: true, data }
    } catch (err) {
      reportClientError('auth.register', err)
      error.value = err.message
      toast.error('Error al registrar usuario: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpia los errores
   */
  function clearError() {
    error.value = null
  }

  return {
    // Estado
    user,
    session,
    loading,
    error,
    userRole,
    initialized,
    lastResumeAt,
    // Computed
    isAuthenticated,
    userEmail,
    isAdmin,
    isStaff,
    // Acciones
    initSession,
    login,
    logout,
    register,
    clearError,
    checkUserRole,
    triggerResume
  }
})

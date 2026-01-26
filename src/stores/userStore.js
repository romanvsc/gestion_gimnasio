import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'

export const useUserStore = defineStore('user', () => {
  // Estado
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const userRole = ref(null) // 'admin', 'staff', o null

  // Computed
  const isAuthenticated = computed(() => !!session.value)
  const userEmail = computed(() => user.value?.email || '')
  const isAdmin = computed(() => userRole.value === 'admin')
  const isStaff = computed(() => userRole.value === 'staff' || userRole.value === 'admin')

  // Acciones

  /**
   * Verifica el rol del usuario en la tabla staff
   */
  async function checkUserRole(userId) {
    try {
      const { data: staffData } = await supabase
        .from('staff')
        .select('rol')
        .eq('id', userId)
        .single()

      if (staffData?.rol) {
        userRole.value = staffData.rol
        console.log(`Usuario con rol: ${staffData.rol}`)
        if (staffData.rol === 'admin') {
          console.log('Bienvenido Jefe')
        } else {
          console.log('Usuario normal o empleado')
        }
      } else {
        userRole.value = null
        console.log('Usuario sin rol asignado')
      }
    } catch (err) {
      console.error('Error al verificar rol:', err)
      userRole.value = null
    }
  }

  /**
   * Inicializa la sesión desde Supabase
   * Se llama al cargar la app para restaurar la sesión
   */
  async function initSession() {
    try {
      loading.value = true
      error.value = null

      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Error obteniendo sesión:', sessionError)
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
        await checkUserRole(currentSession.user.id)
      } else {
        // No hay sesión, resetear todo
        session.value = null
        user.value = null
        userRole.value = null
      }

      // Escuchar cambios en la autenticación (incluyendo refresh de token)
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('Auth state changed:', event)

        session.value = newSession
        user.value = newSession?.user || null

        if (newSession?.user) {
          await checkUserRole(newSession.user.id)
        } else {
          userRole.value = null
        }

        // Si el token se refrescó, actualizar la sesión
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refrescado automáticamente')
        }

        // Si la sesión expiró, limpiar todo
        if (event === 'SIGNED_OUT') {
          session.value = null
          user.value = null
          userRole.value = null
        }
      })
    } catch (err) {
      console.error('Error al inicializar sesión:', err)
      error.value = err.message
      // IMPORTANTE: Resetear todo en caso de error crítico
      session.value = null
      user.value = null
      userRole.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async function login(email, password) {
    try {
      loading.value = true
      error.value = null

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) throw loginError

      session.value = data.session
      user.value = data.user

      // Verificar el rol del usuario después del login
      await checkUserRole(data.user.id)

      return { success: true }
    } catch (err) {
      console.error('Error en login:', err)
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
      console.error('Error en logout:', err)
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
      console.error('Error en registro:', err)
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
    checkUserRole
  }
})

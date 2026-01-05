import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

export function useAuth() {
  const userStore = useUserStore()

  // Computed properties
  const isAuthenticated = computed(() => userStore.isAuthenticated)
  const user = computed(() => userStore.user)
  const isAdmin = computed(() => userStore.isAdmin)
  const isStaff = computed(() => userStore.isStaff)
  const userRole = computed(() => userStore.userRole)
  const loading = computed(() => userStore.loading)

  // Métodos
  async function login(email, password) {
    return await userStore.login(email, password)
  }

  async function logout() {
    return await userStore.logout()
  }

  async function register(email, password) {
    return await userStore.register(email, password)
  }

  return {
    // Estado
    isAuthenticated,
    user,
    isAdmin,
    isStaff,
    userRole,
    loading,
    // Métodos
    login,
    logout,
    register
  }
}
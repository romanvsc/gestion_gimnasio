/**
 * Adaptador de autenticación para los casos de uso que necesitan actor.
 */
export function createSupabaseCurrentUserProvider({ client }) {
  if (!client) {
    throw new Error('Se requiere un cliente Supabase para obtener el usuario actual')
  }

  return {
    async getCurrentUserId() {
      const { data, error } = await client.auth.getUser()

      if (error) {
        throw error
      }

      if (!data?.user?.id) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión nuevamente.')
      }

      return data.user.id
    }
  }
}

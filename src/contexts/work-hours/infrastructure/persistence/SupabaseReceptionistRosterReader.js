export const RECEPTIONIST_FIELDS = 'id, usuario, email, rol, activo'

async function execute(query) {
  const { data, error } = await query

  if (error) throw error
  return data
}

export function createSupabaseReceptionistRosterReader({ client }) {
  if (!client) {
    throw new Error('Se requiere un cliente Supabase para consultar recepcionistas')
  }

  return {
    async findReceptionists() {
      return execute(
        client
          .from('staff')
          .select(RECEPTIONIST_FIELDS)
          .eq('rol', 'recepcion')
          .order('activo', { ascending: false })
          .order('usuario')
      )
    }
  }
}

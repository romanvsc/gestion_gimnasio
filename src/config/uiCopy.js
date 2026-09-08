/**
 * Textos compartidos de la interfaz.
 *
 * Los términos propios del gimnasio se mantienen porque forman parte del
 * vocabulario cotidiano del equipo. Las frases se escriben en voseo y con
 * foco en la tarea que la persona quiere completar.
 */
export const UI_COPY = Object.freeze({
  navigation: Object.freeze({
    home: 'Inicio',
    workHours: 'Banco de horas',
    members: 'Socios',
    access: 'Control de acceso',
    payments: 'Pagos',
    reports: 'Reportes',
    cash: 'Caja',
    staff: 'Equipo',
    settings: 'Configuración'
  }),
  actions: Object.freeze({
    back: 'Volver',
    cancel: 'Cancelar',
    close: 'Cerrar',
    save: 'Guardar',
    add: 'Agregar',
    retry: 'Intentar de nuevo',
    understood: 'Entendido'
  }),
  states: Object.freeze({
    loading: 'Cargando información...',
    noResults: 'No encontramos resultados.',
    noData: 'Todavía no hay datos para mostrar.'
  }),
  terms: Object.freeze({
    member: 'socio',
    membership: 'cuota',
    physicalCertificate: 'apto físico',
    cashRegister: 'Caja',
    workHours: 'banco de horas'
  }),
  errors: Object.freeze({
    generic: 'No pudimos completar la operación. Revisá los datos e intentá de nuevo.',
    load: 'No pudimos cargar esta información. Intentá de nuevo.',
    connection: 'No pudimos conectarnos. Revisá internet e intentá de nuevo.',
    session: 'Tu sesión venció. Volvé a iniciar sesión.',
    permission: 'No tenés permiso para realizar esta acción.',
    duplicate: 'Ya existe un registro con esos datos. Revisá la información.',
    relatedData: 'No pudimos completar la operación porque hay información relacionada.',
    unavailable: 'Esta información no está disponible en este momento. Intentá de nuevo.'
  })
})

export const ROLE_LABELS = Object.freeze({
  admin: 'Administrador',
  recepcion: 'Recepción',
  staff: 'Personal'
})

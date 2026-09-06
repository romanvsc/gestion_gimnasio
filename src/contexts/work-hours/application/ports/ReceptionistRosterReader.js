/**
 * Puerto de lectura para consultar el personal que puede ser seleccionado en
 * Work Hours. IdentityAccess conserva la propiedad de la tabla staff.
 *
 * @typedef {Object} ReceptionistRosterReader
 * @property {() => Promise<Array<{id: string, usuario: string, email: string, rol: string, activo: boolean}>>} findReceptionists
 */

export {}

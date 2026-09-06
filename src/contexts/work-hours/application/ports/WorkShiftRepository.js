/**
 * Puerto driven del aggregate WorkShift.
 *
 * @typedef {Object} WorkShiftRepository
 * @property {(staffId: string, range: {startDate: string, endDate: string}) => Promise<import('../../domain/entities/WorkShift.js').WorkShift[]>} findByStaffAndMonth
 * @property {(shift: import('../../domain/entities/WorkShift.js').WorkShift) => Promise<import('../../domain/entities/WorkShift.js').WorkShift>} create
 * @property {(id: string, shift: import('../../domain/entities/WorkShift.js').WorkShift) => Promise<import('../../domain/entities/WorkShift.js').WorkShift>} update
 */

export {}

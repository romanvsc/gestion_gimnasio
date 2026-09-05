/**
 * Puerto driven del aggregate Plan.
 *
 * @typedef {Object} PlanRepository
 * @property {() => Promise<import('../../domain/entities/Plan.js').Plan[]>} findActive
 * @property {() => Promise<import('../../domain/entities/Plan.js').Plan[]>} findAll
 * @property {(plan: import('../../domain/entities/Plan.js').Plan) => Promise<import('../../domain/entities/Plan.js').Plan>} create
 * @property {(id: number|string, plan: import('../../domain/entities/Plan.js').Plan) => Promise<import('../../domain/entities/Plan.js').Plan>} update
 */

export {}

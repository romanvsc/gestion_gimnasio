/**
 * Puerto ACL para consultar únicamente los datos que Billing necesita del
 * contexto Plans & Catalog. No expone ni importa la entidad Plan.
 * @typedef {Object} PlanBillingReader
 * @property {(input: {planId: number|string, isClubMember?: boolean}) => Promise<{planId: number, durationDays: number, amount: number}>} getBillingData
 */

export {}

import sdk from './sdk'

/**
 * Shared typed API instance for QF network.
 * Used by contract-write utilities that need direct access to the typed API.
 */
export const typedApi = sdk('qf_network').api

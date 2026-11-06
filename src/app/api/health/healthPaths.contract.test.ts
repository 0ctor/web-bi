import { describe, expect, it } from 'vitest'

/**
 * Contrato canônico de health Octor (FE Next: /api/health/*).
 * Statuspage e Docker HEALTHCHECK dependem destes paths.
 */
export const HEALTH_LIVE_PATH = '/api/health/live'
export const HEALTH_READY_PATH = '/api/health/ready'

describe('Contrato — health paths do web-bi', () => {
  it('expõe live e ready canônicos', () => {
    expect(HEALTH_LIVE_PATH).toBe('/api/health/live')
    expect(HEALTH_READY_PATH).toBe('/api/health/ready')
  })
})

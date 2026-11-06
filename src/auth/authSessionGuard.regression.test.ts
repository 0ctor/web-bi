import { describe, expect, it } from 'vitest'
import { shouldClearAuthSessionOnAxiosError } from './authSessionGuard'
import type { AxiosError } from 'axios'

/**
 * Regressão missão-crítica: delog falso no rolling deploy.
 * Qualquer 401 de API de negócio NÃO pode limpar a sessão SSO.
 */
describe('authSessionGuard — regressão delog em deploy', () => {
  it('401 em rota de negócio não limpa sessão', () => {
    const err = {
      isAxiosError: true,
      name: 'AxiosError',
      message: 'Unauthorized',
      toJSON: () => ({}),
      response: {
        status: 401,
        data: {},
        statusText: 'Unauthorized',
        headers: {},
        config: {} as never,
      },
      config: { url: '/v2/business' } as never,
    } as AxiosError

    expect(shouldClearAuthSessionOnAxiosError(err)).toBe(false)
  })
})

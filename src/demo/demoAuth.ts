import type { AuthenticatedUser, AuthTokens } from '@/types/auth'

export const DEMO_USER: AuthenticatedUser = {
  id: 1,
  personId: 1,
  email: 'demo@batelms.app',
  fullName: 'Usuário Demonstração',
  preferredName: 'Demo',
  hasSystemAccess: true,
  isAdmin: true,
  roles: ['Administrador'],
  permissions: []
}

/** Tokens fictícios — nunca enviados à API no modo demo. */
export function createDemoAuthTokens(): AuthTokens {
  const farFuture = '2099-12-31T23:59:59.000Z'

  return {
    accessToken: 'demo-access-token',
    refreshToken: 'demo-refresh-token',
    accessTokenExpiresAt: farFuture,
    refreshTokenExpiresAt: farFuture,
    user: DEMO_USER
  }
}

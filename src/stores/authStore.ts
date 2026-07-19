import { defineStore } from 'pinia'
import { createDemoAuthTokens, DEMO_USER } from '@/demo/demoAuth'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { authService } from '@/services/authService'
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  hasValidAccessToken,
  hasValidRefreshToken,
  isTokenExpired,
  setStoredAuthSession
} from '@/services/authStorage'
import { refreshStoredSession } from '@/services/sessionRefresh'
import type { AuthTokens, AuthenticatedUser, LoginRequest, RegisterRequest } from '@/types/auth'
import { hasAllPermissions, hasAnyPermission, hasPermission } from '@/utils/permissions'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  accessTokenExpiresAt: string | null
  refreshTokenExpiresAt: string | null
  user: AuthenticatedUser | null
}

function normalizeUser(user: AuthenticatedUser | null): AuthenticatedUser | null {
  if (!user) {
    return null
  }

  return {
    ...user,
    roles: user.roles ?? [],
    permissions: user.permissions ?? []
  }
}

function createEmptyState(): AuthState {
  return {
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    user: null
  }
}

function mapTokensToState(tokens: AuthTokens): AuthState {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    user: normalizeUser(tokens.user)
  }
}

function hasActiveSession(state: AuthState): boolean {
  if (IS_DEMO_MODE) {
    return Boolean(state.user)
  }

  if (!state.user) {
    return false
  }

  if (state.accessToken && !isTokenExpired(state.accessTokenExpiresAt)) {
    return true
  }

  return Boolean(state.refreshToken && !isTokenExpired(state.refreshTokenExpiresAt, 0))
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => createEmptyState(),
  getters: {
    isAuthenticated: (state) => hasActiveSession(state),
    isAdmin: (state) => state.user?.isAdmin === true,
    displayName: (state) => state.user?.preferredName || state.user?.fullName || '',
    permissions: (state) => state.user?.permissions ?? [],
    roles: (state) => state.user?.roles ?? []
  },
  actions: {
    hasPermission(permission: string): boolean {
      return hasPermission(this.isAdmin, this.permissions, permission)
    },

    hasAnyPermission(required: readonly string[]): boolean {
      return hasAnyPermission(this.isAdmin, this.permissions, required)
    },

    hasAllPermissions(required: readonly string[]): boolean {
      return hasAllPermissions(this.isAdmin, this.permissions, required)
    },

    initializeDemoSession(): void {
      const tokens = createDemoAuthTokens()
      Object.assign(this.$state, mapTokensToState(tokens))
    },

    initializeFromStorage(): void {
      if (IS_DEMO_MODE) {
        this.initializeDemoSession()
        return
      }

      const storedSession = getStoredAuthSession()

      if (!storedSession) {
        Object.assign(this.$state, createEmptyState())
        return
      }

      if (!hasValidRefreshToken(storedSession)) {
        this.clearSession()
        return
      }

      Object.assign(this.$state, {
        accessToken: storedSession.accessToken,
        refreshToken: storedSession.refreshToken,
        accessTokenExpiresAt: storedSession.accessTokenExpiresAt,
        refreshTokenExpiresAt: storedSession.refreshTokenExpiresAt,
        user: normalizeUser(storedSession.user)
      })
    },

    async ensureValidSession(): Promise<void> {
      if (IS_DEMO_MODE) {
        if (!this.user) {
          this.initializeDemoSession()
        }

        return
      }

      const storedSession = getStoredAuthSession()

      if (!storedSession) {
        return
      }

      if (!hasValidRefreshToken(storedSession)) {
        this.clearSession()
        return
      }

      if (hasValidAccessToken(storedSession)) {
        return
      }

      const tokens = await refreshStoredSession()

      if (!tokens) {
        this.clearSession()
      }
    },

    applyAuthTokens(tokens: AuthTokens): void {
      Object.assign(this.$state, mapTokensToState(tokens))
      setStoredAuthSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        user: normalizeUser(tokens.user)!
      })
    },

    async register(payload: RegisterRequest): Promise<string> {
      if (IS_DEMO_MODE) {
        const response = await authService.register(payload)
        return response.message
      }

      const response = await authService.register(payload)

      if (!response.payload?.requiresAdminApproval) {
        throw new Error(response.message || 'Não foi possível concluir o cadastro.')
      }

      return response.message
    },

    async login(payload: LoginRequest): Promise<string> {
      if (IS_DEMO_MODE) {
        this.initializeDemoSession()
        return 'Login simulado no modo demonstração.'
      }

      try {
        const response = await authService.login(payload)

        if (!response.payload) {
          throw new Error('login_failed')
        }

        this.applyAuthTokens(response.payload)
        return response.message
      } catch {
        throw new Error('Não foi possível fazer login. Verifique suas credenciais e tente novamente.')
      }
    },

    async logout(): Promise<void> {
      if (IS_DEMO_MODE) {
        this.initializeDemoSession()
        return
      }

      const refreshToken = this.refreshToken

      if (refreshToken) {
        try {
          await authService.logout(refreshToken)
        } catch {
          // Mesmo com falha no backend, a sessão local deve ser encerrada.
        }
      }

      this.clearSession()
    },

    clearSession(): void {
      if (IS_DEMO_MODE) {
        this.initializeDemoSession()
        return
      }

      Object.assign(this.$state, createEmptyState())
      clearStoredAuthSession()
    },

    async refreshUser(): Promise<void> {
      if (IS_DEMO_MODE) {
        this.user = normalizeUser(DEMO_USER)
        return
      }

      if (!this.isAuthenticated) {
        return
      }

      const response = await authService.me()

      if (!response.payload) {
        return
      }

      this.user = normalizeUser(response.payload)

      const storedSession = getStoredAuthSession()

      if (storedSession && this.user) {
        setStoredAuthSession({
          ...storedSession,
          user: this.user
        })
      }
    }
  }
})

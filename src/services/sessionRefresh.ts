import {
  clearStoredAuthSession,
  getStoredAuthSession,
  getStoredRefreshToken,
  hasValidAccessToken,
  hasValidRefreshToken,
  setStoredAuthSession
} from '@/services/authStorage'
import type { ApiResponse, AuthTokens } from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const DEVICE_NAME = 'Bless App Web'

let refreshPromise: Promise<AuthTokens | null> | null = null

async function syncAuthStore(tokens: AuthTokens): Promise<void> {
  const { useAuthStore } = await import('@/stores/authStore')
  useAuthStore().applyAuthTokens(tokens)
}

async function clearAuthStore(): Promise<void> {
  const { useAuthStore } = await import('@/stores/authStore')
  useAuthStore().clearSession()
}

async function requestRefresh(refreshToken: string): Promise<AuthTokens | null> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refreshToken,
      deviceName: DEVICE_NAME
    })
  })

  if (!response.ok) {
    return null
  }

  const body = await response.json() as ApiResponse<AuthTokens>

  if (!body.payload) {
    return null
  }

  return body.payload
}

export async function refreshStoredSession(): Promise<AuthTokens | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const refreshToken = getStoredRefreshToken()

    if (!refreshToken) {
      return null
    }

    const session = getStoredAuthSession()

    if (!hasValidRefreshToken(session)) {
      return null
    }

    const tokens = await requestRefresh(refreshToken)

    if (!tokens) {
      clearStoredAuthSession()
      await clearAuthStore()
      return null
    }

    setStoredAuthSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      user: tokens.user
    })

    await syncAuthStore(tokens)

    return tokens
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

export async function ensureStoredAccessToken(): Promise<boolean> {
  const session = getStoredAuthSession()

  if (!session) {
    return false
  }

  if (!hasValidRefreshToken(session)) {
    clearStoredAuthSession()
    await clearAuthStore()
    return false
  }

  if (hasValidAccessToken(session)) {
    return true
  }

  const tokens = await refreshStoredSession()
  return tokens !== null
}

export async function handleSessionExpired(): Promise<void> {
  clearStoredAuthSession()
  await clearAuthStore()

  const { default: router } = await import('@/router')

  if (router.currentRoute.value.name === 'login') {
    return
  }

  await router.push({
    name: 'login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}

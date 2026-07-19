import type { StoredAuthSession } from '@/types/auth'

const STORAGE_KEY = 'batelms.auth'
const DEFAULT_EXPIRY_BUFFER_MS = 30_000

export function getStoredAuthSession(): StoredAuthSession | null {
  const rawValue = localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as StoredAuthSession
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function setStoredAuthSession(session: StoredAuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredAuthSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getStoredAccessToken(): string | null {
  return getStoredAuthSession()?.accessToken ?? null
}

export function getStoredRefreshToken(): string | null {
  return getStoredAuthSession()?.refreshToken ?? null
}

export function isTokenExpired(
  expiresAt: string | null | undefined,
  bufferMs = DEFAULT_EXPIRY_BUFFER_MS
): boolean {
  if (!expiresAt) {
    return true
  }

  const expiresAtMs = Date.parse(expiresAt)

  if (Number.isNaN(expiresAtMs)) {
    return true
  }

  return expiresAtMs - bufferMs <= Date.now()
}

export function hasValidRefreshToken(session: StoredAuthSession | null): boolean {
  if (!session?.refreshToken) {
    return false
  }

  return !isTokenExpired(session.refreshTokenExpiresAt, 0)
}

export function hasValidAccessToken(session: StoredAuthSession | null): boolean {
  if (!session?.accessToken) {
    return false
  }

  return !isTokenExpired(session.accessTokenExpiresAt)
}

export type AuthenticatedUser = {
  id: number
  personId: number
  email: string
  fullName: string
  preferredName: string | null
  hasSystemAccess: boolean
  isAdmin: boolean
  roles: string[]
  permissions: string[]
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
  user: AuthenticatedUser
}

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type ApiResponse<TPayload> = {
  statusCode: number
  success: boolean
  message: string
  payload: TPayload | null
  timestamp: string
}

export type RegisterRequest = {
  fullName: string
  email: string
  password: string
  preferredName?: string | null
  deviceName?: string | null
}

export type RegistrationResult = {
  requiresAdminApproval: boolean
}

export type LoginRequest = {
  email: string
  password: string
  deviceName?: string | null
}

export type StoredAuthSession = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
  user: AuthenticatedUser
}

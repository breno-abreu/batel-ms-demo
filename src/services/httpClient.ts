import {
  ensureStoredAccessToken,
  handleSessionExpired,
  refreshStoredSession
} from '@/services/sessionRefresh'
import { getStoredAccessToken } from '@/services/authStorage'
import { unsavedChangesStore } from '@/stores/unsavedChangesStore'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipErrorRedirect?: boolean
  skipAuthRefresh?: boolean
  isRetryAfterRefresh?: boolean
}

export class HttpError extends Error {
  status: number

  constructor(status: number, message?: string) {
    super(message ?? `Erro na requisição: ${status}`)
    this.name = 'HttpError'
    this.status = status
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function redirectByStatus(status: number): void {
  const routeNameByStatus: Record<number, string> = {
    401: 'unauthorized',
    404: 'not-found'
  }

  const routeName = routeNameByStatus[status]

  if (!routeName) {
    return
  }

  void import('@/router').then(({ default: router }) => {
    if (router.currentRoute.value.name === routeName) {
      return
    }

    void router.push({ name: routeName })
  })
}

async function performRequest<TResponse>(
  path: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const {
    body,
    headers,
    skipErrorRedirect = false,
    skipAuthRefresh = false,
    isRetryAfterRefresh = false,
    ...requestOptions
  } = options

  if (!skipAuthRefresh) {
    const hasValidSession = await ensureStoredAccessToken()

    if (!hasValidSession && getStoredAccessToken()) {
      await handleSessionExpired()
      throw new HttpError(401, 'Sessão expirada. Faça login novamente.')
    }
  }

  const requestHeaders = new Headers(headers)

  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const accessToken = getStoredAccessToken()

  if (accessToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  if (response.status === 401 && !skipAuthRefresh && !isRetryAfterRefresh) {
    const refreshed = await refreshStoredSession()

    if (refreshed) {
      return performRequest<TResponse>(path, {
        ...options,
        isRetryAfterRefresh: true
      })
    }

    await handleSessionExpired()
  }

  if (!response.ok) {
    if (!skipErrorRedirect) {
      redirectByStatus(response.status)
    }

    let errorMessage = `Erro na requisição: ${response.status}`

    try {
      const errorBody = await response.json() as { message?: string; Message?: string }
      const apiMessage = errorBody.message ?? errorBody.Message

      if (apiMessage) {
        errorMessage = apiMessage
      }
    } catch {
      // Mantém a mensagem padrão quando o corpo não for JSON.
    }

    throw new HttpError(response.status, errorMessage)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

async function request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const savingOperation = unsavedChangesStore.beginSavingFromSubmission(options.method ?? 'GET')

  try {
    const response = await performRequest<TResponse>(path, options)

    if (savingOperation) {
      unsavedChangesStore.finishSaving(savingOperation, true)
    }

    return response
  } catch (error) {
    if (savingOperation) {
      unsavedChangesStore.finishSaving(savingOperation, false)
    }

    throw error
  }
}

export const httpClient = {
  get: <TResponse>(path: string, options?: RequestOptions) =>
    request<TResponse>(path, { ...options, method: 'GET' }),
  post: <TResponse>(path: string, body?: unknown, options?: RequestOptions) =>
    request<TResponse>(path, { ...options, method: 'POST', body }),
  put: <TResponse>(path: string, body?: unknown, options?: RequestOptions) =>
    request<TResponse>(path, { ...options, method: 'PUT', body }),
  patch: <TResponse>(path: string, body?: unknown, options?: RequestOptions) =>
    request<TResponse>(path, { ...options, method: 'PATCH', body }),
  delete: <TResponse>(path: string, options?: RequestOptions) =>
    request<TResponse>(path, { ...options, method: 'DELETE' })
}

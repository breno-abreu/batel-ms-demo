import type { ApiResponse, PagedResult } from '@/types/api'

const DEMO_MUTATION_MESSAGE = 'Operação simulada com sucesso no modo demonstração.'

export function demoOk<T>(
  payload: T,
  message = 'Consulta realizada com sucesso.',
  statusCode = 200
): ApiResponse<T> {
  return {
    statusCode,
    success: true,
    message,
    payload,
    timestamp: new Date().toISOString()
  }
}

export function demoMutationOk<T>(
  payload: T | null = null,
  message = DEMO_MUTATION_MESSAGE
): ApiResponse<T> {
  return {
    statusCode: 200,
    success: true,
    message,
    payload,
    timestamp: new Date().toISOString()
  }
}

export function demoNotFound<T = null>(message = 'Registro não encontrado.'): ApiResponse<T> {
  return {
    statusCode: 404,
    success: false,
    message,
    payload: null,
    timestamp: new Date().toISOString()
  }
}

export function paginateItems<T>(
  items: readonly T[],
  page = 1,
  pageSize = 20
): PagedResult<T> {
  const safePageSize = Math.max(1, pageSize)
  const safePage = Math.max(1, page)
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize))
  const currentPage = Math.min(safePage, totalPages)
  const start = (currentPage - 1) * safePageSize

  return {
    items: items.slice(start, start + safePageSize) as T[],
    page: currentPage,
    pageSize: safePageSize,
    totalItems,
    totalPages
  }
}

export function matchesSearch(value: string | null | undefined, search?: string): boolean {
  const term = search?.trim().toLowerCase()

  if (!term) {
    return true
  }

  return (value ?? '').toLowerCase().includes(term)
}

export const demoAudit = {
  createdAt: '2026-01-10T12:00:00.000Z',
  createdBy: 1 as number | null,
  updatedAt: '2026-03-15T14:30:00.000Z' as string | null,
  updatedBy: 1 as number | null,
  deletedAt: null as string | null,
  deletedBy: null as number | null
}

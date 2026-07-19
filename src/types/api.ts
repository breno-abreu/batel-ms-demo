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

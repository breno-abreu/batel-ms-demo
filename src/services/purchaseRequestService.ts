import { demoPurchaseRequestApi } from '@/demo/api/requestDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreatePurchaseRequestPayload,
  PurchaseRequestListQuery,
  PurchaseRequestListResponse,
  PurchaseRequestResponse,
  UpdatePurchaseRequestPayload
} from '@/types/requests'

function buildListQueryString(query: PurchaseRequestListQuery = {}): string {
  const params = new URLSearchParams()
  const search = query.search?.trim()

  if (search) {
    params.set('search', search)
  }

  if (query.ministryId) {
    params.set('ministryId', String(query.ministryId))
  }

  if (query.purchaseRequestStatusId) {
    params.set('purchaseRequestStatusId', String(query.purchaseRequestStatusId))
  }

  if (query.priorityId) {
    params.set('priorityId', String(query.priorityId))
  }

  params.set('page', String(query.page ?? 1))
  params.set('pageSize', String(query.pageSize ?? 20))

  return params.toString()
}

export const purchaseRequestService = {
  list(query: PurchaseRequestListQuery = {}) {
    if (IS_DEMO_MODE) {
      return demoPurchaseRequestApi.list(query)
    }

    const queryString = buildListQueryString(query)

    return httpClient.get<PurchaseRequestListResponse>(`/api/purchase-requests?${queryString}`)
  },

  create(payload: CreatePurchaseRequestPayload) {
    if (IS_DEMO_MODE) {
      return demoPurchaseRequestApi.create()
    }

    return httpClient.post<PurchaseRequestResponse>(
      '/api/purchase-requests',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdatePurchaseRequestPayload) {
    if (IS_DEMO_MODE) {
      return demoPurchaseRequestApi.update(id)
    }

    return httpClient.put<PurchaseRequestResponse>(
      `/api/purchase-requests/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoPurchaseRequestApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/purchase-requests/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

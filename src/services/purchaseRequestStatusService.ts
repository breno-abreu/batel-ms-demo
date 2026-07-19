import { demoPurchaseRequestStatusApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreatePurchaseRequestStatusRequest,
  PurchaseRequestStatusListResponse,
  PurchaseRequestStatusResponse,
  ReorderCatalogStatusesRequest,
  UpdatePurchaseRequestStatusRequest
} from '@/types/requests'

export const purchaseRequestStatusService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoPurchaseRequestStatusApi.list()
    }

    return httpClient.get<PurchaseRequestStatusListResponse>('/api/purchase-request-statuses')
  },

  create(payload: CreatePurchaseRequestStatusRequest) {
    if (IS_DEMO_MODE) {
      return demoPurchaseRequestStatusApi.create()
    }

    return httpClient.post<PurchaseRequestStatusResponse>(
      '/api/purchase-request-statuses',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdatePurchaseRequestStatusRequest) {
    if (IS_DEMO_MODE) {
      return demoPurchaseRequestStatusApi.update(id)
    }

    return httpClient.put<PurchaseRequestStatusResponse>(
      `/api/purchase-request-statuses/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  reorder(payload: ReorderCatalogStatusesRequest) {
    if (IS_DEMO_MODE) {
      return demoPurchaseRequestStatusApi.reorder()
    }

    return httpClient.put<PurchaseRequestStatusListResponse>(
      '/api/purchase-request-statuses/reorder',
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoPurchaseRequestStatusApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/purchase-request-statuses/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

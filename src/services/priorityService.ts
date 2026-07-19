import { demoPriorityApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreatePriorityRequest,
  PriorityListResponse,
  PriorityResponse,
  ReorderPrioritiesRequest,
  UpdatePriorityRequest
} from '@/types/tickets'

export const priorityService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoPriorityApi.list()
    }

    return httpClient.get<PriorityListResponse>('/api/priorities')
  },

  create(payload: CreatePriorityRequest) {
    if (IS_DEMO_MODE) {
      return demoPriorityApi.create()
    }

    return httpClient.post<PriorityResponse>(
      '/api/priorities',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdatePriorityRequest) {
    if (IS_DEMO_MODE) {
      return demoPriorityApi.update(id)
    }

    return httpClient.put<PriorityResponse>(
      `/api/priorities/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  reorder(payload: ReorderPrioritiesRequest) {
    if (IS_DEMO_MODE) {
      return demoPriorityApi.reorder()
    }

    return httpClient.put<PriorityListResponse>(
      '/api/priorities/reorder',
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoPriorityApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/priorities/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

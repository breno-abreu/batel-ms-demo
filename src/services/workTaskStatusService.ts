import { demoWorkTaskStatusApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateWorkTaskStatusRequest,
  ReorderCatalogStatusesRequest,
  UpdateWorkTaskStatusRequest,
  WorkTaskStatusListResponse,
  WorkTaskStatusResponse
} from '@/types/requests'

export const workTaskStatusService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoWorkTaskStatusApi.list()
    }

    return httpClient.get<WorkTaskStatusListResponse>('/api/task-statuses')
  },

  create(payload: CreateWorkTaskStatusRequest) {
    if (IS_DEMO_MODE) {
      return demoWorkTaskStatusApi.create()
    }

    return httpClient.post<WorkTaskStatusResponse>(
      '/api/task-statuses',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateWorkTaskStatusRequest) {
    if (IS_DEMO_MODE) {
      return demoWorkTaskStatusApi.update(id)
    }

    return httpClient.put<WorkTaskStatusResponse>(
      `/api/task-statuses/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  reorder(payload: ReorderCatalogStatusesRequest) {
    if (IS_DEMO_MODE) {
      return demoWorkTaskStatusApi.reorder()
    }

    return httpClient.put<WorkTaskStatusListResponse>(
      '/api/task-statuses/reorder',
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoWorkTaskStatusApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/task-statuses/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

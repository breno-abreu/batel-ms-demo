import { demoWorkTaskApi } from '@/demo/api/requestDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateWorkTaskPayload,
  UpdateWorkTaskPayload,
  WorkTaskListQuery,
  WorkTaskListResponse,
  WorkTaskResponse
} from '@/types/requests'

function buildListQueryString(query: WorkTaskListQuery = {}): string {
  const params = new URLSearchParams()
  const search = query.search?.trim()

  if (search) {
    params.set('search', search)
  }

  if (query.ministryId) {
    params.set('ministryId', String(query.ministryId))
  }

  if (query.taskStatusId) {
    params.set('taskStatusId', String(query.taskStatusId))
  }

  if (query.taskPriorityId) {
    params.set('taskPriorityId', String(query.taskPriorityId))
  }

  params.set('page', String(query.page ?? 1))
  params.set('pageSize', String(query.pageSize ?? 20))

  return params.toString()
}

export const workTaskService = {
  list(query: WorkTaskListQuery = {}) {
    if (IS_DEMO_MODE) {
      return demoWorkTaskApi.list(query)
    }

    const queryString = buildListQueryString(query)

    return httpClient.get<WorkTaskListResponse>(`/api/tasks?${queryString}`)
  },

  create(payload: CreateWorkTaskPayload) {
    if (IS_DEMO_MODE) {
      return demoWorkTaskApi.create()
    }

    return httpClient.post<WorkTaskResponse>(
      '/api/tasks',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateWorkTaskPayload) {
    if (IS_DEMO_MODE) {
      return demoWorkTaskApi.update(id)
    }

    return httpClient.put<WorkTaskResponse>(
      `/api/tasks/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoWorkTaskApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/tasks/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

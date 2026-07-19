import { demoEventTypeApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateEventTypeRequest,
  EventTypeListResponse,
  EventTypeResponse,
  UpdateEventTypeRequest
} from '@/types/events'

export const eventTypeService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoEventTypeApi.list()
    }

    return httpClient.get<EventTypeListResponse>('/api/event-types')
  },

  create(payload: CreateEventTypeRequest) {
    if (IS_DEMO_MODE) {
      return demoEventTypeApi.create()
    }

    return httpClient.post<EventTypeResponse>(
      '/api/event-types',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateEventTypeRequest) {
    if (IS_DEMO_MODE) {
      return demoEventTypeApi.update(id)
    }

    return httpClient.put<EventTypeResponse>(
      `/api/event-types/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoEventTypeApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/event-types/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

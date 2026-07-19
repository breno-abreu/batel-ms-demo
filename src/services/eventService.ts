import { demoEventApi } from '@/demo/api/eventDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateEventRequest,
  EventCalendarListResponse,
  EventDetailsResponse,
  SeriesEditScope,
  UpdateEventRequest
} from '@/types/events'

export const eventService = {
  listByDateRange(startDate: string, endDate: string) {
    if (IS_DEMO_MODE) {
      return demoEventApi.listByDateRange(startDate, endDate)
    }

    const params = new URLSearchParams({
      startDate,
      endDate
    })

    return httpClient.get<EventCalendarListResponse>(`/api/events?${params.toString()}`)
  },

  getById(id: number) {
    if (IS_DEMO_MODE) {
      return demoEventApi.getById(id)
    }

    return httpClient.get<EventDetailsResponse>(`/api/events/${id}`)
  },

  create(payload: CreateEventRequest) {
    if (IS_DEMO_MODE) {
      return demoEventApi.create()
    }

    return httpClient.post<EventDetailsResponse>(
      '/api/events',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateEventRequest) {
    if (IS_DEMO_MODE) {
      return demoEventApi.update(id)
    }

    return httpClient.put<EventDetailsResponse>(
      `/api/events/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number, scope: SeriesEditScope = 'thisOnly') {
    if (IS_DEMO_MODE) {
      return demoEventApi.remove(id, scope)
    }

    const params = new URLSearchParams({ scope })

    return httpClient.delete<ApiResponse<null>>(
      `/api/events/${id}?${params.toString()}`,
      { skipErrorRedirect: true }
    )
  }
}

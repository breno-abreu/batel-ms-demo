import { demoEventScheduleApi } from '@/demo/api/eventDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateEventScheduleRequest,
  EventScheduleItemResponse,
  EventSchedulePageResponse,
  EventScheduleShareLinkResponse,
  PublicEventSchedulePageResponse,
  UpdateEventScheduleRequest
} from '@/types/eventSchedule'

const PUBLIC_EVENT_SCHEDULE_SHARE_ROUTE = '/public/cronogramas'

export function buildPublicEventScheduleShareUrl(shareHash: string): string {
  if (typeof window === 'undefined') {
    return `${PUBLIC_EVENT_SCHEDULE_SHARE_ROUTE}/${shareHash}`
  }

  return `${window.location.origin}${PUBLIC_EVENT_SCHEDULE_SHARE_ROUTE}/${shareHash}`
}

export const eventScheduleService = {
  listByEvent(eventId: number) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleApi.listByEvent(eventId)
    }

    return httpClient.get<EventSchedulePageResponse>(`/api/events/${eventId}/schedule`)
  },

  create(eventId: number, payload: CreateEventScheduleRequest) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleApi.create(eventId)
    }

    return httpClient.post<EventScheduleItemResponse>(
      `/api/events/${eventId}/schedule`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateEventScheduleRequest) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleApi.update(id)
    }

    return httpClient.put<EventScheduleItemResponse>(
      `/api/event-schedule/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/event-schedule/${id}`,
      { skipErrorRedirect: true }
    )
  },

  generateShareLink(eventId: number) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleApi.generateShareLink(eventId)
    }

    return httpClient.post<EventScheduleShareLinkResponse>(
      `/api/events/${eventId}/schedule/share-link`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  getPublicByShareHash(shareHash: string) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleApi.getPublicByShareHash(shareHash)
    }

    return httpClient.get<PublicEventSchedulePageResponse>(
      `/api/public/event-schedules/${encodeURIComponent(shareHash)}`,
      { skipAuthRefresh: true, skipErrorRedirect: true }
    )
  }
}

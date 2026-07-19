import { demoEventScheduleTemplateApi } from '@/demo/api/eventDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateEventScheduleTemplateFromEventRequest,
  EventSchedulePageFromTemplateResponse,
  EventScheduleTemplateDetailsResponse,
  EventScheduleTemplateListResponse
} from '@/types/eventScheduleTemplate'

export const eventScheduleTemplateService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoEventScheduleTemplateApi.list()
    }

    return httpClient.get<EventScheduleTemplateListResponse>('/api/event-schedule-templates')
  },

  getById(id: number) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleTemplateApi.getById(id)
    }

    return httpClient.get<EventScheduleTemplateDetailsResponse>(
      `/api/event-schedule-templates/${id}`
    )
  },

  createFromEvent(eventId: number, payload: CreateEventScheduleTemplateFromEventRequest) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleTemplateApi.createFromEvent()
    }

    return httpClient.post<EventScheduleTemplateDetailsResponse>(
      `/api/event-schedule-templates/from-event/${eventId}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  applyToEvent(templateId: number, eventId: number) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleTemplateApi.applyToEvent(templateId, eventId)
    }

    return httpClient.post<EventSchedulePageFromTemplateResponse>(
      `/api/event-schedule-templates/${templateId}/apply/${eventId}`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoEventScheduleTemplateApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/event-schedule-templates/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

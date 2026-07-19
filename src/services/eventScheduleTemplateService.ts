import { demoEventScheduleTemplateApi } from '@/demo/api/eventDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateEventScheduleTemplateFromEventRequest } from '@/types/eventScheduleTemplate'

export const eventScheduleTemplateService = {
  list() {
    return demoEventScheduleTemplateApi.list()
  },
  getById(id: number) {
    return demoEventScheduleTemplateApi.getById(id)
  },

  createFromEvent(_eventId: number, _payload: CreateEventScheduleTemplateFromEventRequest) {
    return withDemoMutation(() => demoEventScheduleTemplateApi.createFromEvent())
  },

  applyToEvent(templateId: number, eventId: number) {
    return withDemoMutation(() => demoEventScheduleTemplateApi.applyToEvent(templateId, eventId))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoEventScheduleTemplateApi.remove())
  }
}

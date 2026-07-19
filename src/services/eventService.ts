import { demoEventApi } from '@/demo/api/eventDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateEventRequest, SeriesEditScope, UpdateEventRequest } from '@/types/events'

export const eventService = {
  listByDateRange(startDate: string, endDate: string) {
    return demoEventApi.listByDateRange(startDate, endDate)
  },

  getById(id: number) {
    return demoEventApi.getById(id)
  },

  create(_payload: CreateEventRequest) {
    return withDemoMutation(() => demoEventApi.create())
  },

  update(id: number, _payload: UpdateEventRequest) {
    return withDemoMutation(() => demoEventApi.update(id))
  },

  remove(id: number, scope: SeriesEditScope = 'thisOnly') {
    return withDemoMutation(() => demoEventApi.remove(id, scope))
  }
}

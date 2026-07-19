import { demoEventTypeApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateEventTypeRequest, UpdateEventTypeRequest } from '@/types/events'

export const eventTypeService = {
  list() {
    return demoEventTypeApi.list()
  },
  create(_payload: CreateEventTypeRequest) {
    return withDemoMutation(() => demoEventTypeApi.create())
  },

  update(id: number, _payload: UpdateEventTypeRequest) {
    return withDemoMutation(() => demoEventTypeApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoEventTypeApi.remove())
  }
}

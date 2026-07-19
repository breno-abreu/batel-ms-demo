import { demoMinistryApi } from '@/demo/api/personDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateMinistryRequest, UpdateMinistryRequest } from '@/types/people'

export const ministryService = {
  list() {
    return demoMinistryApi.list()
  },
  create(_payload: CreateMinistryRequest) {
    return withDemoMutation(() => demoMinistryApi.create())
  },

  update(id: number, _payload: UpdateMinistryRequest) {
    return withDemoMutation(() => demoMinistryApi.update(id))
  },

  toggleActive(id: number) {
    return withDemoMutation(() => demoMinistryApi.toggleActive(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoMinistryApi.remove())
  },

  listMembersForSchedule(id: number) {
    return demoMinistryApi.listMembersForSchedule(id)
  }
}

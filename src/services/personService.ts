import { demoPersonApi } from '@/demo/api/personDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreatePersonRequest, UpdatePersonRequest, UpdateSelfPersonRequest } from '@/types/people'

export const personService = {
  list() {
    return demoPersonApi.list()
  },

  checkEmailAvailability(email: string, _excludePersonId?: number | null) {
    return demoPersonApi.checkEmailAvailability(email)
  },

  listForSelection() {
    return demoPersonApi.listForSelection()
  },

  listBirthdays(month: number, day?: number) {
    return demoPersonApi.listBirthdays(month, day)
  },

  getById(id: number) {
    return demoPersonApi.getById(id)
  },

  getMe() {
    return demoPersonApi.getMe()
  },

  create(_payload: CreatePersonRequest) {
    return withDemoMutation(() => demoPersonApi.create())
  },

  update(id: number, _payload: UpdatePersonRequest) {
    return withDemoMutation(() => demoPersonApi.update(id))
  },

  updateMe(_payload: UpdateSelfPersonRequest) {
    return withDemoMutation(() => demoPersonApi.updateMe())
  },

  toggleActive(id: number) {
    return withDemoMutation(() => demoPersonApi.toggleActive(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoPersonApi.remove())
  }
}

import { demoSkillApi } from '@/demo/api/personDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateSkillRequest, UpdateSkillRequest } from '@/types/people'

export const skillService = {
  list() {
    return demoSkillApi.list()
  },
  create(_payload: CreateSkillRequest) {
    return withDemoMutation(() => demoSkillApi.create())
  },

  update(id: number, _payload: UpdateSkillRequest) {
    return withDemoMutation(() => demoSkillApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoSkillApi.remove())
  }
}

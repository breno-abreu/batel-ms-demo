import { demoPriorityApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreatePriorityRequest, ReorderPrioritiesRequest, UpdatePriorityRequest } from '@/types/tickets'

export const priorityService = {
  list() {
    return demoPriorityApi.list()
  },
  create(_payload: CreatePriorityRequest) {
    return withDemoMutation(() => demoPriorityApi.create())
  },

  update(id: number, _payload: UpdatePriorityRequest) {
    return withDemoMutation(() => demoPriorityApi.update(id))
  },

  reorder(_payload: ReorderPrioritiesRequest) {
    return withDemoMutation(() => demoPriorityApi.reorder())
  },

  remove(_id: number) {
    return withDemoMutation(() => demoPriorityApi.remove())
  }
}

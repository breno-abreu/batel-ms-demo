import { demoWorkTaskApi } from '@/demo/api/requestDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateWorkTaskPayload, UpdateWorkTaskPayload, WorkTaskListQuery } from '@/types/requests'

export const workTaskService = {
  list(query: WorkTaskListQuery = {}) {
    return demoWorkTaskApi.list(query)
  },

  create(_payload: CreateWorkTaskPayload) {
    return withDemoMutation(() => demoWorkTaskApi.create())
  },

  update(id: number, _payload: UpdateWorkTaskPayload) {
    return withDemoMutation(() => demoWorkTaskApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoWorkTaskApi.remove())
  }
}

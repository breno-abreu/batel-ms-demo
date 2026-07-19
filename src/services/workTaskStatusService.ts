import { demoWorkTaskStatusApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateWorkTaskStatusRequest, ReorderCatalogStatusesRequest, UpdateWorkTaskStatusRequest } from '@/types/requests'

export const workTaskStatusService = {
  list() {
    return demoWorkTaskStatusApi.list()
  },
  create(_payload: CreateWorkTaskStatusRequest) {
    return withDemoMutation(() => demoWorkTaskStatusApi.create())
  },

  update(id: number, _payload: UpdateWorkTaskStatusRequest) {
    return withDemoMutation(() => demoWorkTaskStatusApi.update(id))
  },

  reorder(_payload: ReorderCatalogStatusesRequest) {
    return withDemoMutation(() => demoWorkTaskStatusApi.reorder())
  },

  remove(_id: number) {
    return withDemoMutation(() => demoWorkTaskStatusApi.remove())
  }
}

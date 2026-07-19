import { demoPurchaseRequestStatusApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreatePurchaseRequestStatusRequest, ReorderCatalogStatusesRequest, UpdatePurchaseRequestStatusRequest } from '@/types/requests'

export const purchaseRequestStatusService = {
  list() {
    return demoPurchaseRequestStatusApi.list()
  },
  create(_payload: CreatePurchaseRequestStatusRequest) {
    return withDemoMutation(() => demoPurchaseRequestStatusApi.create())
  },

  update(id: number, _payload: UpdatePurchaseRequestStatusRequest) {
    return withDemoMutation(() => demoPurchaseRequestStatusApi.update(id))
  },

  reorder(_payload: ReorderCatalogStatusesRequest) {
    return withDemoMutation(() => demoPurchaseRequestStatusApi.reorder())
  },

  remove(_id: number) {
    return withDemoMutation(() => demoPurchaseRequestStatusApi.remove())
  }
}

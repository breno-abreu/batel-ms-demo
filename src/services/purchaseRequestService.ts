import { demoPurchaseRequestApi } from '@/demo/api/requestDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreatePurchaseRequestPayload, PurchaseRequestListQuery, UpdatePurchaseRequestPayload } from '@/types/requests'

export const purchaseRequestService = {
  list(query: PurchaseRequestListQuery = {}) {
    return demoPurchaseRequestApi.list(query)
  },

  create(_payload: CreatePurchaseRequestPayload) {
    return withDemoMutation(() => demoPurchaseRequestApi.create())
  },

  update(id: number, _payload: UpdatePurchaseRequestPayload) {
    return withDemoMutation(() => demoPurchaseRequestApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoPurchaseRequestApi.remove())
  }
}

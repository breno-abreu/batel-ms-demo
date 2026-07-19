import { demoUsefulLinkTypeApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateUsefulLinkTypeRequest, UpdateUsefulLinkTypeRequest } from '@/types/usefulLinks'

export const usefulLinkTypeService = {
  list() {
    return demoUsefulLinkTypeApi.list()
  },
  create(_payload: CreateUsefulLinkTypeRequest) {
    return withDemoMutation(() => demoUsefulLinkTypeApi.create())
  },

  update(id: number, _payload: UpdateUsefulLinkTypeRequest) {
    return withDemoMutation(() => demoUsefulLinkTypeApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoUsefulLinkTypeApi.remove())
  }
}

import { demoUsefulLinkApi } from '@/demo/api/usefulLinkDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { SaveUsefulLinkRequest, UsefulLinkListQuery } from '@/types/usefulLinks'

export const usefulLinkService = {
  list(query: UsefulLinkListQuery = {}) {
    return demoUsefulLinkApi.list(query)
  },

  getById(id: number) {
    return demoUsefulLinkApi.getById(id)
  },

  create(_payload: SaveUsefulLinkRequest) {
    return withDemoMutation(() => demoUsefulLinkApi.create())
  },

  update(id: number, _payload: SaveUsefulLinkRequest) {
    return withDemoMutation(() => demoUsefulLinkApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoUsefulLinkApi.remove())
  }
}

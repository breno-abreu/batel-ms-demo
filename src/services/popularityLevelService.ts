import { demoPopularityLevelApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreatePopularityLevelRequest, ReorderPopularityLevelsRequest, UpdatePopularityLevelRequest } from '@/types/repertoire'

export const popularityLevelService = {
  list() {
    return demoPopularityLevelApi.list()
  },
  create(_payload: CreatePopularityLevelRequest) {
    return withDemoMutation(() => demoPopularityLevelApi.create())
  },

  update(id: number, _payload: UpdatePopularityLevelRequest) {
    return withDemoMutation(() => demoPopularityLevelApi.update(id))
  },

  reorder(_payload: ReorderPopularityLevelsRequest) {
    return withDemoMutation(() => demoPopularityLevelApi.reorder())
  },

  remove(_id: number) {
    return withDemoMutation(() => demoPopularityLevelApi.remove())
  }
}

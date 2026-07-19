import { demoDifficultyLevelApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateDifficultyLevelRequest, ReorderDifficultyLevelsRequest, UpdateDifficultyLevelRequest } from '@/types/repertoire'

export const difficultyLevelService = {
  list() {
    return demoDifficultyLevelApi.list()
  },
  create(_payload: CreateDifficultyLevelRequest) {
    return withDemoMutation(() => demoDifficultyLevelApi.create())
  },

  update(id: number, _payload: UpdateDifficultyLevelRequest) {
    return withDemoMutation(() => demoDifficultyLevelApi.update(id))
  },

  reorder(_payload: ReorderDifficultyLevelsRequest) {
    return withDemoMutation(() => demoDifficultyLevelApi.reorder())
  },

  remove(_id: number) {
    return withDemoMutation(() => demoDifficultyLevelApi.remove())
  }
}

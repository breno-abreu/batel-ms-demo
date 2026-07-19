import { demoRepertoireApi } from '@/demo/api/repertoireDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { RepertoireListQuery, SaveRepertoireRequest } from '@/types/repertoire'

export const repertoireService = {
  list(query: RepertoireListQuery = {}) {
    return demoRepertoireApi.list(query)
  },

  getById(id: number) {
    return demoRepertoireApi.getById(id)
  },

  create(_payload: SaveRepertoireRequest) {
    return withDemoMutation(() => demoRepertoireApi.create())
  },

  update(id: number, _payload: SaveRepertoireRequest) {
    return withDemoMutation(() => demoRepertoireApi.update(id))
  },

  setFavorite(_id: number, _isFavorite: boolean) {
    return withDemoMutation(() => demoRepertoireApi.setFavorite())
  },

  remove(_id: number) {
    return withDemoMutation(() => demoRepertoireApi.remove())
  }
}

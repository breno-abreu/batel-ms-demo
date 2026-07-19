import { demoMusicalThemeApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateMusicalThemeRequest, UpdateMusicalThemeRequest } from '@/types/repertoire'

export const musicalThemeService = {
  list() {
    return demoMusicalThemeApi.list()
  },
  create(_payload: CreateMusicalThemeRequest) {
    return withDemoMutation(() => demoMusicalThemeApi.create())
  },

  update(id: number, _payload: UpdateMusicalThemeRequest) {
    return withDemoMutation(() => demoMusicalThemeApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoMusicalThemeApi.remove())
  }
}

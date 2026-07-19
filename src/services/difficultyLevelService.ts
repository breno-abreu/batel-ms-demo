import { demoDifficultyLevelApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateDifficultyLevelRequest,
  DifficultyLevelListResponse,
  DifficultyLevelResponse,
  ReorderDifficultyLevelsRequest,
  UpdateDifficultyLevelRequest
} from '@/types/repertoire'

export const difficultyLevelService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoDifficultyLevelApi.list()
    }

    return httpClient.get<DifficultyLevelListResponse>('/api/difficulty-levels')
  },

  create(payload: CreateDifficultyLevelRequest) {
    if (IS_DEMO_MODE) {
      return demoDifficultyLevelApi.create()
    }

    return httpClient.post<DifficultyLevelResponse>(
      '/api/difficulty-levels',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateDifficultyLevelRequest) {
    if (IS_DEMO_MODE) {
      return demoDifficultyLevelApi.update(id)
    }

    return httpClient.put<DifficultyLevelResponse>(
      `/api/difficulty-levels/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  reorder(payload: ReorderDifficultyLevelsRequest) {
    if (IS_DEMO_MODE) {
      return demoDifficultyLevelApi.reorder()
    }

    return httpClient.put<DifficultyLevelListResponse>(
      '/api/difficulty-levels/reorder',
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoDifficultyLevelApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/difficulty-levels/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

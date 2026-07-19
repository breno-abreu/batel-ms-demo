import { demoPopularityLevelApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreatePopularityLevelRequest,
  PopularityLevelListResponse,
  PopularityLevelResponse,
  ReorderPopularityLevelsRequest,
  UpdatePopularityLevelRequest
} from '@/types/repertoire'

export const popularityLevelService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoPopularityLevelApi.list()
    }

    return httpClient.get<PopularityLevelListResponse>('/api/popularity-levels')
  },

  create(payload: CreatePopularityLevelRequest) {
    if (IS_DEMO_MODE) {
      return demoPopularityLevelApi.create()
    }

    return httpClient.post<PopularityLevelResponse>(
      '/api/popularity-levels',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdatePopularityLevelRequest) {
    if (IS_DEMO_MODE) {
      return demoPopularityLevelApi.update(id)
    }

    return httpClient.put<PopularityLevelResponse>(
      `/api/popularity-levels/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  reorder(payload: ReorderPopularityLevelsRequest) {
    if (IS_DEMO_MODE) {
      return demoPopularityLevelApi.reorder()
    }

    return httpClient.put<PopularityLevelListResponse>(
      '/api/popularity-levels/reorder',
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoPopularityLevelApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/popularity-levels/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

import { demoRepertoireApi } from '@/demo/api/repertoireDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse, PagedResult } from '@/types/auth'
import type {
  RepertoireDetailsResponse,
  RepertoireListItem,
  RepertoireListQuery,
  SaveRepertoireRequest
} from '@/types/repertoire'

type RepertoirePagedResponse = ApiResponse<PagedResult<RepertoireListItem>>

export const repertoireService = {
  list(query: RepertoireListQuery = {}) {
    if (IS_DEMO_MODE) {
      return demoRepertoireApi.list(query)
    }

    const params = new URLSearchParams()
    const search = query.search?.trim()

    if (search) {
      params.set('search', search)
    }

    if (query.difficultyLevelId) {
      params.set('difficultyLevelId', String(query.difficultyLevelId))
    }

    if (query.popularityLevelId) {
      params.set('popularityLevelId', String(query.popularityLevelId))
    }

    if (query.musicalThemeId) {
      params.set('musicalThemeId', String(query.musicalThemeId))
    }

    if (query.favoritesOnly) {
      params.set('favoritesOnly', 'true')
    }

    params.set('page', String(query.page ?? 1))
    params.set('pageSize', String(query.pageSize ?? 20))

    const queryString = params.toString()

    return httpClient.get<RepertoirePagedResponse>(
      `/api/repertoires?${queryString}`
    )
  },

  getById(id: number) {
    if (IS_DEMO_MODE) {
      return demoRepertoireApi.getById(id)
    }

    return httpClient.get<RepertoireDetailsResponse>(`/api/repertoires/${id}`)
  },

  create(payload: SaveRepertoireRequest) {
    if (IS_DEMO_MODE) {
      return demoRepertoireApi.create()
    }

    return httpClient.post<RepertoireDetailsResponse>(
      '/api/repertoires',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: SaveRepertoireRequest) {
    if (IS_DEMO_MODE) {
      return demoRepertoireApi.update(id)
    }

    return httpClient.put<RepertoireDetailsResponse>(
      `/api/repertoires/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  setFavorite(id: number, isFavorite: boolean) {
    if (IS_DEMO_MODE) {
      return demoRepertoireApi.setFavorite()
    }

    return httpClient.put<ApiResponse<object | null>>(
      `/api/repertoires/${id}/favorite`,
      { isFavorite },
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoRepertoireApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/repertoires/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

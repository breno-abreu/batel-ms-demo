import { demoUsefulLinkApi } from '@/demo/api/usefulLinkDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  SaveUsefulLinkRequest,
  UsefulLinkListQuery,
  UsefulLinkListResponse,
  UsefulLinkResponse
} from '@/types/usefulLinks'

export const usefulLinkService = {
  list(query: UsefulLinkListQuery = {}) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkApi.list(query)
    }

    const params = new URLSearchParams()
    const search = query.search?.trim()

    if (search) {
      params.set('search', search)
    }

    if (query.usefulLinkTypeId) {
      params.set('usefulLinkTypeId', String(query.usefulLinkTypeId))
    }

    params.set('page', String(query.page ?? 1))
    params.set('pageSize', String(query.pageSize ?? 20))

    const queryString = params.toString()

    return httpClient.get<UsefulLinkListResponse>(`/api/useful-links?${queryString}`)
  },

  getById(id: number) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkApi.getById(id)
    }

    return httpClient.get<UsefulLinkResponse>(`/api/useful-links/${id}`)
  },

  create(payload: SaveUsefulLinkRequest) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkApi.create()
    }

    return httpClient.post<UsefulLinkResponse>(
      '/api/useful-links',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: SaveUsefulLinkRequest) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkApi.update(id)
    }

    return httpClient.put<UsefulLinkResponse>(
      `/api/useful-links/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/useful-links/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

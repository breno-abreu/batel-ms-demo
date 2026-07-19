import { demoSongSuggestionApi } from '@/demo/api/miscDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse, PagedResult } from '@/types/auth'
import type {
  CreateSongSuggestionRequest,
  ReviewSongSuggestionRequest,
  SongSuggestionAdminItemResponse,
  SongSuggestionAdminListItem,
  SongSuggestionAdminListQuery,
  SongSuggestionItemResponse,
  SongSuggestionListResponse,
  UpdateSongSuggestionRequest
} from '@/types/songSuggestion'

type SongSuggestionAdminPagedResponse = ApiResponse<PagedResult<SongSuggestionAdminListItem>>

export const songSuggestionService = {
  listMine() {
    if (IS_DEMO_MODE) {
      return demoSongSuggestionApi.listMine()
    }

    return httpClient.get<SongSuggestionListResponse>('/api/song-suggestions')
  },

  create(payload: CreateSongSuggestionRequest) {
    if (IS_DEMO_MODE) {
      return demoSongSuggestionApi.create()
    }

    return httpClient.post<SongSuggestionItemResponse>(
      '/api/song-suggestions',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateSongSuggestionRequest) {
    if (IS_DEMO_MODE) {
      return demoSongSuggestionApi.update(id)
    }

    return httpClient.put<SongSuggestionItemResponse>(
      `/api/song-suggestions/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoSongSuggestionApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/song-suggestions/${id}`,
      { skipErrorRedirect: true }
    )
  },

  listForAdmin(query: SongSuggestionAdminListQuery = {}) {
    if (IS_DEMO_MODE) {
      return demoSongSuggestionApi.listForAdmin(query)
    }

    const params = new URLSearchParams()
    const search = query.search?.trim()

    if (search) {
      params.set('search', search)
    }

    if (query.status && query.status !== 'all') {
      params.set('status', query.status)
    }

    params.set('page', String(query.page ?? 1))
    params.set('pageSize', String(query.pageSize ?? 20))

    const queryString = params.toString()

    return httpClient.get<SongSuggestionAdminPagedResponse>(
      `/api/admin/song-suggestions?${queryString}`
    )
  },

  review(id: number, payload: ReviewSongSuggestionRequest) {
    if (IS_DEMO_MODE) {
      return demoSongSuggestionApi.review(id)
    }

    return httpClient.put<SongSuggestionAdminItemResponse>(
      `/api/admin/song-suggestions/${id}/review`,
      payload,
      { skipErrorRedirect: true }
    )
  }
}

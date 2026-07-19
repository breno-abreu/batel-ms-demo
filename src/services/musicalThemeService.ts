import { demoMusicalThemeApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateMusicalThemeRequest,
  MusicalThemeListResponse,
  MusicalThemeResponse,
  UpdateMusicalThemeRequest
} from '@/types/repertoire'

export const musicalThemeService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoMusicalThemeApi.list()
    }

    return httpClient.get<MusicalThemeListResponse>('/api/musical-themes')
  },

  create(payload: CreateMusicalThemeRequest) {
    if (IS_DEMO_MODE) {
      return demoMusicalThemeApi.create()
    }

    return httpClient.post<MusicalThemeResponse>(
      '/api/musical-themes',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateMusicalThemeRequest) {
    if (IS_DEMO_MODE) {
      return demoMusicalThemeApi.update(id)
    }

    return httpClient.put<MusicalThemeResponse>(
      `/api/musical-themes/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoMusicalThemeApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/musical-themes/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

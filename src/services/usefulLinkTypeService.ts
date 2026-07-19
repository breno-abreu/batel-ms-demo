import { demoUsefulLinkTypeApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateUsefulLinkTypeRequest,
  UpdateUsefulLinkTypeRequest,
  UsefulLinkTypeListResponse,
  UsefulLinkTypeResponse
} from '@/types/usefulLinks'

export const usefulLinkTypeService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkTypeApi.list()
    }

    return httpClient.get<UsefulLinkTypeListResponse>('/api/useful-link-types')
  },

  create(payload: CreateUsefulLinkTypeRequest) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkTypeApi.create()
    }

    return httpClient.post<UsefulLinkTypeResponse>(
      '/api/useful-link-types',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateUsefulLinkTypeRequest) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkTypeApi.update(id)
    }

    return httpClient.put<UsefulLinkTypeResponse>(
      `/api/useful-link-types/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkTypeApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/useful-link-types/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

import { demoSkillApi } from '@/demo/api/personDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateSkillRequest,
  SkillListResponse,
  SkillResponse,
  UpdateSkillRequest
} from '@/types/people'

export const skillService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoSkillApi.list()
    }

    return httpClient.get<SkillListResponse>('/api/skills')
  },

  create(payload: CreateSkillRequest) {
    if (IS_DEMO_MODE) {
      return demoSkillApi.create()
    }

    return httpClient.post<SkillResponse>(
      '/api/skills',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateSkillRequest) {
    if (IS_DEMO_MODE) {
      return demoSkillApi.update(id)
    }

    return httpClient.put<SkillResponse>(
      `/api/skills/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoSkillApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/skills/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

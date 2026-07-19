import { demoMinistryApi } from '@/demo/api/personDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateMinistryRequest,
  MinistryListResponse,
  MinistryResponse,
  UpdateMinistryRequest
} from '@/types/people'
import type { MinistryMembersForScheduleResponse } from '@/types/teamSchedules'

export const ministryService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoMinistryApi.list()
    }

    return httpClient.get<MinistryListResponse>('/api/ministries')
  },

  create(payload: CreateMinistryRequest) {
    if (IS_DEMO_MODE) {
      return demoMinistryApi.create()
    }

    return httpClient.post<MinistryResponse>(
      '/api/ministries',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateMinistryRequest) {
    if (IS_DEMO_MODE) {
      return demoMinistryApi.update(id)
    }

    return httpClient.put<MinistryResponse>(
      `/api/ministries/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  toggleActive(id: number) {
    if (IS_DEMO_MODE) {
      return demoMinistryApi.toggleActive(id)
    }

    return httpClient.put<MinistryResponse>(
      `/api/ministries/${id}/toggle-active`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoMinistryApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/ministries/${id}`,
      { skipErrorRedirect: true }
    )
  },

  listMembersForSchedule(id: number) {
    if (IS_DEMO_MODE) {
      return demoMinistryApi.listMembersForSchedule(id)
    }

    return httpClient.get<MinistryMembersForScheduleResponse>(
      `/api/ministries/${id}/members-for-schedule`
    )
  }
}

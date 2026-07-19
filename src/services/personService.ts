import { demoPersonApi } from '@/demo/api/personDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  ChangeOwnPasswordRequest,
  CreatePersonRequest,
  PersonBirthdayListResponse,
  PersonDetailsResponse,
  PersonEmailAvailabilityResponse,
  PersonListResponse,
  PersonSummaryListResponse,
  UpdatePersonRequest,
  UpdateSelfPersonRequest
} from '@/types/people'

export const personService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoPersonApi.list()
    }

    return httpClient.get<PersonListResponse>('/api/people')
  },

  checkEmailAvailability(email: string, excludePersonId?: number | null) {
    if (IS_DEMO_MODE) {
      return demoPersonApi.checkEmailAvailability(email)
    }

    const params = new URLSearchParams()
    params.set('email', email)

    if (excludePersonId) {
      params.set('excludePersonId', String(excludePersonId))
    }

    return httpClient.get<PersonEmailAvailabilityResponse>(
      `/api/people/email-availability?${params.toString()}`,
      { skipErrorRedirect: true }
    )
  },

  listForSelection() {
    if (IS_DEMO_MODE) {
      return demoPersonApi.listForSelection()
    }

    return httpClient.get<PersonSummaryListResponse>('/api/people/selection')
  },

  listBirthdays(month: number, day?: number) {
    if (IS_DEMO_MODE) {
      return demoPersonApi.listBirthdays(month, day)
    }

    const params = new URLSearchParams()
    params.set('month', String(month))

    if (day) {
      params.set('day', String(day))
    }

    return httpClient.get<PersonBirthdayListResponse>(`/api/people/birthdays?${params.toString()}`)
  },

  getById(id: number) {
    if (IS_DEMO_MODE) {
      return demoPersonApi.getById(id)
    }

    return httpClient.get<PersonDetailsResponse>(`/api/people/${id}`)
  },

  getMe() {
    if (IS_DEMO_MODE) {
      return demoPersonApi.getMe()
    }

    return httpClient.get<PersonDetailsResponse>('/api/people/me')
  },

  create(payload: CreatePersonRequest) {
    if (IS_DEMO_MODE) {
      return demoPersonApi.create()
    }

    return httpClient.post<PersonDetailsResponse>(
      '/api/people',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdatePersonRequest) {
    if (IS_DEMO_MODE) {
      return demoPersonApi.update(id)
    }

    return httpClient.put<PersonDetailsResponse>(
      `/api/people/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  updateMe(payload: UpdateSelfPersonRequest) {
    if (IS_DEMO_MODE) {
      return demoPersonApi.updateMe()
    }

    return httpClient.put<PersonDetailsResponse>(
      '/api/people/me',
      payload,
      { skipErrorRedirect: true }
    )
  },

  changeOwnPassword(payload: ChangeOwnPasswordRequest) {
    if (IS_DEMO_MODE) {
      return demoPersonApi.changeOwnPassword()
    }

    return httpClient.put<ApiResponse<null>>(
      '/api/people/me/password',
      payload,
      { skipErrorRedirect: true }
    )
  },

  toggleActive(id: number) {
    if (IS_DEMO_MODE) {
      return demoPersonApi.toggleActive(id)
    }

    return httpClient.put<PersonDetailsResponse>(
      `/api/people/${id}/toggle-active`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoPersonApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/people/${id}`,
      { skipErrorRedirect: true }
    )
  }
}

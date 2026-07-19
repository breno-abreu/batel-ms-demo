import { demoTicketApi } from '@/demo/api/ticketDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  AdminUpdateTicketRequest,
  CreateTicketRequest,
  TicketAdminListResponse,
  TicketAdminResponse,
  TicketListQuery,
  TicketListResponse,
  TicketResponse,
  UpdateTicketRequest
} from '@/types/tickets'

function buildListQueryString(query: TicketListQuery = {}): string {
  const params = new URLSearchParams()
  const search = query.search?.trim()

  if (search) {
    params.set('search', search)
  }

  if (query.ticketTypeId) {
    params.set('ticketTypeId', String(query.ticketTypeId))
  }

  if (query.ticketStatusId) {
    params.set('ticketStatusId', String(query.ticketStatusId))
  }

  if (query.ticketPriorityId) {
    params.set('ticketPriorityId', String(query.ticketPriorityId))
  }

  params.set('page', String(query.page ?? 1))
  params.set('pageSize', String(query.pageSize ?? 20))

  return params.toString()
}

export const ticketService = {
  listMine(query: TicketListQuery = {}) {
    if (IS_DEMO_MODE) {
      return demoTicketApi.listMine(query)
    }

    const queryString = buildListQueryString(query)

    return httpClient.get<TicketListResponse>(`/api/tickets?${queryString}`)
  },

  create(payload: CreateTicketRequest) {
    if (IS_DEMO_MODE) {
      return demoTicketApi.create()
    }

    return httpClient.post<TicketResponse>(
      '/api/tickets',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateTicketRequest) {
    if (IS_DEMO_MODE) {
      return demoTicketApi.update(id)
    }

    return httpClient.put<TicketResponse>(
      `/api/tickets/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoTicketApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/tickets/${id}`,
      { skipErrorRedirect: true }
    )
  },

  listForAdmin(query: TicketListQuery = {}) {
    if (IS_DEMO_MODE) {
      return demoTicketApi.listForAdmin(query)
    }

    const queryString = buildListQueryString(query)

    return httpClient.get<TicketAdminListResponse>(`/api/admin/tickets?${queryString}`)
  },

  getForAdmin(id: number) {
    if (IS_DEMO_MODE) {
      return demoTicketApi.getForAdmin(id)
    }

    return httpClient.get<TicketAdminResponse>(`/api/admin/tickets/${id}`)
  },

  updateByAdmin(id: number, payload: AdminUpdateTicketRequest) {
    if (IS_DEMO_MODE) {
      return demoTicketApi.updateByAdmin(id)
    }

    return httpClient.put<TicketAdminResponse>(
      `/api/admin/tickets/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  }
}

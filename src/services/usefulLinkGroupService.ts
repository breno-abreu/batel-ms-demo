import { demoUsefulLinkGroupApi } from '@/demo/api/usefulLinkDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type { UsefulLink } from '@/types/usefulLinks'
import type {
  CreateUsefulLinkGroupRequest,
  PublicUsefulLinkGroupResponse,
  UpdateUsefulLinkGroupRequest,
  UsefulLinkGroupListQuery,
  UsefulLinkGroupListResponse,
  UsefulLinkGroupResponse,
  UsefulLinkGroupShareLinkResponse,
  UsefulLinkGroupUsefulLinkListResponse
} from '@/types/usefulLinkGroup'

const PUBLIC_SHARE_ROUTE = '/public/links-uteis'

export function buildPublicShareUrl(shareHash: string): string {
  if (typeof window === 'undefined') {
    return `${PUBLIC_SHARE_ROUTE}/${shareHash}`
  }

  return `${window.location.origin}${PUBLIC_SHARE_ROUTE}/${shareHash}`
}

export const usefulLinkGroupService = {
  list(query: UsefulLinkGroupListQuery = {}) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.list(query)
    }

    const params = new URLSearchParams()
    const search = query.search?.trim()

    if (search) {
      params.set('search', search)
    }

    if (query.visibility) {
      params.set('visibility', query.visibility)
    }

    params.set('page', String(query.page ?? 1))
    params.set('pageSize', String(query.pageSize ?? 20))

    return httpClient.get<UsefulLinkGroupListResponse>(
      `/api/useful-link-groups?${params.toString()}`
    )
  },

  getById(id: number) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.getById(id)
    }

    return httpClient.get<UsefulLinkGroupResponse>(`/api/useful-link-groups/${id}`)
  },

  create(payload: CreateUsefulLinkGroupRequest) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.create()
    }

    return httpClient.post<UsefulLinkGroupResponse>(
      '/api/useful-link-groups',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateUsefulLinkGroupRequest) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.update(id, payload)
    }

    return httpClient.put<UsefulLinkGroupResponse>(
      `/api/useful-link-groups/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/useful-link-groups/${id}`,
      { skipErrorRedirect: true }
    )
  },

  generateShareLink(id: number) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.generateShareLink(id)
    }

    return httpClient.post<UsefulLinkGroupShareLinkResponse>(
      `/api/useful-link-groups/${id}/share-link`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  listUsefulLinks(id: number) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.listUsefulLinks(id)
    }

    return httpClient.get<UsefulLinkGroupUsefulLinkListResponse>(
      `/api/useful-link-groups/${id}/useful-links`
    )
  },

  addUsefulLink(groupId: number, usefulLinkId: number) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.addUsefulLink()
    }

    return httpClient.post<ApiResponse<null>>(
      `/api/useful-link-groups/${groupId}/useful-links/${usefulLinkId}`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  removeUsefulLink(groupId: number, usefulLinkId: number) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.removeUsefulLink()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/useful-link-groups/${groupId}/useful-links/${usefulLinkId}`,
      { skipErrorRedirect: true }
    )
  },

  getPublicByShareHash(shareHash: string) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.getPublicByShareHash(shareHash)
    }

    return httpClient.get<PublicUsefulLinkGroupResponse>(
      `/api/public/useful-link-groups/${encodeURIComponent(shareHash)}`,
      { skipAuthRefresh: true, skipErrorRedirect: true }
    )
  },

  listPublicUsefulLinks(shareHash: string) {
    if (IS_DEMO_MODE) {
      return demoUsefulLinkGroupApi.listPublicUsefulLinks(shareHash)
    }

    return httpClient.get<UsefulLinkGroupUsefulLinkListResponse>(
      `/api/public/useful-link-groups/${encodeURIComponent(shareHash)}/useful-links`,
      { skipAuthRefresh: true, skipErrorRedirect: true }
    )
  }
}

export type { UsefulLink }

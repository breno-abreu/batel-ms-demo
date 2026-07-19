import { demoRepertoireGroupApi } from '@/demo/api/repertoireDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { RepertoireListItem } from '@/types/repertoire'
import type {
  CreateRepertoireGroupRequest,
  PublicRepertoireGroupResponse,
  RepertoireGroupListResponse,
  RepertoireGroupRepertoireListResponse,
  RepertoireGroupResponse,
  RepertoireGroupShareLinkResponse,
  UpdateRepertoireGroupRequest
} from '@/types/repertoireGroup'
import type { ApiResponse } from '@/types/auth'

const PUBLIC_SHARE_ROUTE = '/public/repertorio-pasta'

export function buildPublicShareUrl(shareHash: string): string {
  if (typeof window === 'undefined') {
    return `${PUBLIC_SHARE_ROUTE}/${shareHash}`
  }

  return `${window.location.origin}${PUBLIC_SHARE_ROUTE}/${shareHash}`
}

export const repertoireGroupService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.list()
    }

    return httpClient.get<RepertoireGroupListResponse>('/api/repertoire-groups')
  },

  getById(id: number) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.getById(id)
    }

    return httpClient.get<RepertoireGroupResponse>(`/api/repertoire-groups/${id}`)
  },

  create(payload: CreateRepertoireGroupRequest) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.create()
    }

    return httpClient.post<RepertoireGroupResponse>(
      '/api/repertoire-groups',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateRepertoireGroupRequest) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.update(id, payload)
    }

    return httpClient.put<RepertoireGroupResponse>(
      `/api/repertoire-groups/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/repertoire-groups/${id}`,
      { skipErrorRedirect: true }
    )
  },

  generateShareLink(id: number) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.generateShareLink(id)
    }

    return httpClient.post<RepertoireGroupShareLinkResponse>(
      `/api/repertoire-groups/${id}/share-link`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  listRepertoires(id: number) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.listRepertoires(id)
    }

    return httpClient.get<RepertoireGroupRepertoireListResponse>(
      `/api/repertoire-groups/${id}/repertoires`
    )
  },

  addRepertoire(groupId: number, repertoireId: number) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.addRepertoire()
    }

    return httpClient.post<ApiResponse<null>>(
      `/api/repertoire-groups/${groupId}/repertoires/${repertoireId}`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  removeRepertoire(groupId: number, repertoireId: number) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.removeRepertoire()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/repertoire-groups/${groupId}/repertoires/${repertoireId}`,
      { skipErrorRedirect: true }
    )
  },

  getPublicByShareHash(shareHash: string) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.getPublicByShareHash(shareHash)
    }

    return httpClient.get<PublicRepertoireGroupResponse>(
      `/api/public/repertoire-groups/${encodeURIComponent(shareHash)}`,
      { skipAuthRefresh: true, skipErrorRedirect: true }
    )
  },

  listPublicRepertoires(shareHash: string) {
    if (IS_DEMO_MODE) {
      return demoRepertoireGroupApi.listPublicRepertoires(shareHash)
    }

    return httpClient.get<RepertoireGroupRepertoireListResponse>(
      `/api/public/repertoire-groups/${encodeURIComponent(shareHash)}/repertoires`,
      { skipAuthRefresh: true, skipErrorRedirect: true }
    )
  }
}

export type { RepertoireListItem }

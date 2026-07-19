import type { ApiResponse, PagedResult } from '@/types/api'
import type { UsefulLink } from '@/types/usefulLinks'

export type UsefulLinkGroup = {
  id: number
  name: string
  description: string | null
  isPublic: boolean
  allowPublicLinkAccess: boolean
  hasPublicShareLink: boolean
  publicShareHash: string | null
  ownerUserId: number
  isOwnedByCurrentUser: boolean
  itemCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type PublicUsefulLinkGroup = {
  id: number
  name: string
  description: string | null
  itemCount: number
}

export type CreateUsefulLinkGroupRequest = {
  name: string
  description?: string | null
  isPublic: boolean
  allowPublicLinkAccess: boolean
}

export type UpdateUsefulLinkGroupRequest = {
  name: string
  description?: string | null
  isPublic: boolean
  allowPublicLinkAccess: boolean
}

export type UsefulLinkGroupListQuery = {
  search?: string
  visibility?: UsefulLinkGroupVisibilityFilter | null
  page?: number
  pageSize?: number
}

export type UsefulLinkGroupVisibilityFilter = 'private' | 'public' | 'external'

export type UsefulLinkGroupShareLink = {
  shareHash: string
}

export type UsefulLinkGroupResponse = ApiResponse<UsefulLinkGroup>
export type UsefulLinkGroupListResponse = ApiResponse<PagedResult<UsefulLinkGroup>>
export type UsefulLinkGroupUsefulLinkListResponse = ApiResponse<UsefulLink[]>
export type PublicUsefulLinkGroupResponse = ApiResponse<PublicUsefulLinkGroup>
export type UsefulLinkGroupShareLinkResponse = ApiResponse<UsefulLinkGroupShareLink>

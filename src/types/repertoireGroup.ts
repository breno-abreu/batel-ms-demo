import type { ApiResponse } from '@/types/auth'
import type { RepertoireListItem } from '@/types/repertoire'

export type RepertoireGroup = {
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

export type PublicRepertoireGroup = {
  id: number
  name: string
  description: string | null
  itemCount: number
}

export type CreateRepertoireGroupRequest = {
  name: string
  description?: string | null
  isPublic: boolean
  allowPublicLinkAccess: boolean
}

export type UpdateRepertoireGroupRequest = {
  name: string
  description?: string | null
  isPublic: boolean
  allowPublicLinkAccess: boolean
}

export type RepertoireGroupShareLink = {
  shareHash: string
}

export type RepertoireGroupResponse = ApiResponse<RepertoireGroup>
export type RepertoireGroupListResponse = ApiResponse<RepertoireGroup[]>
export type RepertoireGroupRepertoireListResponse = ApiResponse<RepertoireListItem[]>
export type PublicRepertoireGroupResponse = ApiResponse<PublicRepertoireGroup>
export type RepertoireGroupShareLinkResponse = ApiResponse<RepertoireGroupShareLink>

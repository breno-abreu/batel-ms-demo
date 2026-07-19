import type { ApiResponse, PagedResult } from '@/types/auth'

export type UsefulLinkType = {
  id: number
  name: string
  description: string | null
  displayOrder: number
  linkedLinkCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type CreateUsefulLinkTypeRequest = {
  name: string
}

export type UpdateUsefulLinkTypeRequest = {
  name: string
}

export type UsefulLinkTypeResponse = ApiResponse<UsefulLinkType>
export type UsefulLinkTypeListResponse = ApiResponse<UsefulLinkType[]>

export type UsefulLink = {
  id: number
  name: string
  usefulLinkTypeId: number
  usefulLinkTypeName: string
  url: string
  notes: string | null
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type UsefulLinkListQuery = {
  search?: string
  usefulLinkTypeId?: number | null
  page?: number
  pageSize?: number
}

export type SaveUsefulLinkRequest = {
  name: string
  usefulLinkTypeId: number
  url: string
  notes: string | null
}

export type UsefulLinkResponse = ApiResponse<UsefulLink>
export type UsefulLinkListResponse = ApiResponse<PagedResult<UsefulLink>>

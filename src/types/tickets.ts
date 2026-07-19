import type { ApiResponse, PagedResult } from '@/types/api'

export type TicketStatusLifecycleFlag =
  | 'open'
  | 'in_analysis'
  | 'resolved'
  | 'cancelled'

export type TicketStatus = {
  id: number
  name: string
  displayOrder: number
  isOpen: boolean
  isInAnalysis: boolean
  isResolved: boolean
  isCancelled: boolean
  linkedTicketCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type TicketType = {
  id: number
  name: string
  displayOrder: number
  linkedTicketCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type PriorityLevelFlag =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'

export type Priority = {
  id: number
  name: string
  displayOrder: number
  isLow: boolean
  isNormal: boolean
  isHigh: boolean
  isUrgent: boolean
  linkedTicketCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type TicketListItem = {
  id: number
  title: string
  description: string
  ticketTypeId: number
  ticketTypeName: string
  ticketStatusId: number
  ticketStatusName: string
  isOpenStatus: boolean
  isInAnalysisStatus: boolean
  isResolvedStatus: boolean
  isCancelledStatus: boolean
  ticketPriorityId: number
  ticketPriorityName: string
  createdAt: string
}

export type TicketAdminListItem = {
  id: number
  title: string
  description: string
  createdByUserId: number | null
  createdByName: string
  ticketTypeId: number
  ticketTypeName: string
  ticketStatusId: number
  ticketStatusName: string
  isOpenStatus: boolean
  isInAnalysisStatus: boolean
  isResolvedStatus: boolean
  isCancelledStatus: boolean
  ticketPriorityId: number
  ticketPriorityName: string
  createdAt: string
}

export type CreateTicketStatusRequest = {
  name: string
  isOpen: boolean
  isInAnalysis: boolean
  isResolved: boolean
  isCancelled: boolean
}

export type UpdateTicketStatusRequest = {
  name: string
  isOpen: boolean
  isInAnalysis: boolean
  isResolved: boolean
  isCancelled: boolean
}

export type ReorderTicketStatusesRequest = {
  orderedIds: number[]
}

export type CreateTicketTypeRequest = {
  name: string
}

export type UpdateTicketTypeRequest = {
  name: string
}

export type ReorderTicketTypesRequest = {
  orderedIds: number[]
}

export type CreatePriorityRequest = {
  name: string
  isLow: boolean
  isNormal: boolean
  isHigh: boolean
  isUrgent: boolean
}

export type UpdatePriorityRequest = {
  name: string
  isLow: boolean
  isNormal: boolean
  isHigh: boolean
  isUrgent: boolean
}

export type ReorderPrioritiesRequest = {
  orderedIds: number[]
}

export type CreateTicketRequest = {
  title: string
  description: string
  ticketTypeId: number
}

export type UpdateTicketRequest = {
  title: string
  description: string
  ticketTypeId: number
}

export type AdminUpdateTicketRequest = {
  ticketStatusId: number
  ticketPriorityId: number
}

export type TicketListQuery = {
  search?: string
  ticketTypeId?: number | null
  ticketStatusId?: number | null
  ticketPriorityId?: number | null
  page?: number
  pageSize?: number
}

export type TicketStatusResponse = ApiResponse<TicketStatus>
export type TicketStatusListResponse = ApiResponse<TicketStatus[]>
export type TicketTypeResponse = ApiResponse<TicketType>
export type TicketTypeListResponse = ApiResponse<TicketType[]>
export type PriorityResponse = ApiResponse<Priority>
export type PriorityListResponse = ApiResponse<Priority[]>
export type TicketResponse = ApiResponse<TicketListItem>
export type TicketListResponse = ApiResponse<PagedResult<TicketListItem>>
export type TicketAdminResponse = ApiResponse<TicketAdminListItem>
export type TicketAdminListResponse = ApiResponse<PagedResult<TicketAdminListItem>>

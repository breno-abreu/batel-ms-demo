import type { ApiResponse, PagedResult } from '@/types/auth'

export type WorkTaskStatusLifecycleFlag =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type WorkTaskStatus = {
  id: number
  name: string
  displayOrder: number
  isPending: boolean
  isInProgress: boolean
  isCompleted: boolean
  isCancelled: boolean
  linkedTaskCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type PurchaseRequestStatusLifecycleFlag =
  | 'pending'
  | 'in_analysis'
  | 'approved'
  | 'purchased'
  | 'rejected'

export type PurchaseRequestStatus = {
  id: number
  name: string
  displayOrder: number
  isPending: boolean
  isInAnalysis: boolean
  isApproved: boolean
  isPurchased: boolean
  isRejected: boolean
  linkedPurchaseRequestCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type CreateCatalogStatusRequest = {
  name: string
}

export type UpdateCatalogStatusRequest = {
  name: string
}

export type CreatePurchaseRequestStatusRequest = {
  name: string
  isPending: boolean
  isInAnalysis: boolean
  isApproved: boolean
  isPurchased: boolean
  isRejected: boolean
}

export type UpdatePurchaseRequestStatusRequest = CreatePurchaseRequestStatusRequest

export type CreateWorkTaskStatusRequest = {
  name: string
  isPending: boolean
  isInProgress: boolean
  isCompleted: boolean
  isCancelled: boolean
}

export type UpdateWorkTaskStatusRequest = CreateWorkTaskStatusRequest

export type ReorderCatalogStatusesRequest = {
  orderedIds: number[]
}

export type WorkTaskStatusResponse = ApiResponse<WorkTaskStatus>
export type WorkTaskStatusListResponse = ApiResponse<WorkTaskStatus[]>
export type PurchaseRequestStatusResponse = ApiResponse<PurchaseRequestStatus>
export type PurchaseRequestStatusListResponse = ApiResponse<PurchaseRequestStatus[]>

export type PurchaseRequestListItem = {
  id: number
  title: string
  description: string
  ministryId: number
  ministryName: string
  purchaseRequestStatusId: number
  purchaseRequestStatusName: string
  isPendingStatus: boolean
  isInAnalysisStatus: boolean
  isApprovedStatus: boolean
  isPurchasedStatus: boolean
  isRejectedStatus: boolean
  priorityId: number
  priorityName: string
  requestedByPersonId: number
  requestedByPersonName: string
  estimatedValue: number | null
  neededByDate: string | null
  createdAt: string
  createdByUserId: number | null
}

export type CreatePurchaseRequestPayload = {
  title: string
  description: string
  ministryId: number
  purchaseRequestStatusId: number
  priorityId: number
  requestedByPersonId: number
  estimatedValue: number | null
  neededByDate: string | null
}

export type UpdatePurchaseRequestPayload = CreatePurchaseRequestPayload

export type PurchaseRequestListQuery = {
  search?: string
  ministryId?: number | null
  purchaseRequestStatusId?: number | null
  priorityId?: number | null
  page?: number
  pageSize?: number
}

export type PurchaseRequestResponse = ApiResponse<PurchaseRequestListItem>
export type PurchaseRequestListResponse = ApiResponse<PagedResult<PurchaseRequestListItem>>

export type WorkTaskListItem = {
  id: number
  title: string
  description: string
  ministryId: number
  ministryName: string
  taskStatusId: number
  taskStatusName: string
  isPendingStatus: boolean
  isInProgressStatus: boolean
  isCompletedStatus: boolean
  isCancelledStatus: boolean
  taskPriorityId: number
  taskPriorityName: string
  assignedToPersonId: number | null
  assignedToPersonName: string | null
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  createdByUserId: number | null
}

export type CreateWorkTaskPayload = {
  title: string
  description: string
  ministryId: number
  taskStatusId: number
  taskPriorityId: number
  assignedToPersonId: number | null
  dueDate: string | null
}

export type UpdateWorkTaskPayload = CreateWorkTaskPayload

export type WorkTaskListQuery = {
  search?: string
  ministryId?: number | null
  taskStatusId?: number | null
  taskPriorityId?: number | null
  page?: number
  pageSize?: number
}

export type WorkTaskResponse = ApiResponse<WorkTaskListItem>
export type WorkTaskListResponse = ApiResponse<PagedResult<WorkTaskListItem>>

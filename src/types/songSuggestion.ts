import type { ApiResponse } from '@/types/auth'

export type SongSuggestionReviewFilter = 'all' | 'reviewed' | 'pending'

export type SongSuggestionAdminListQuery = {
  search?: string
  status?: SongSuggestionReviewFilter
  page?: number
  pageSize?: number
}

export type SongSuggestionListItem = {
  id: number
  name: string
  url: string | null
  notes: string | null
  isReviewed: boolean
  adminResponse: string | null
  createdAt: string
}

export type SongSuggestionAdminListItem = SongSuggestionListItem & {
  userId: number
  userEmail: string
  userFullName: string
  updatedAt: string | null
}

export type CreateSongSuggestionRequest = {
  name: string
  url?: string | null
  notes?: string | null
}

export type UpdateSongSuggestionRequest = {
  name: string
  url?: string | null
  notes?: string | null
}

export type ReviewSongSuggestionRequest = {
  isReviewed: boolean
  adminResponse?: string | null
}

export type SongSuggestionListResponse = ApiResponse<SongSuggestionListItem[]>
export type SongSuggestionItemResponse = ApiResponse<SongSuggestionListItem>
export type SongSuggestionAdminItemResponse = ApiResponse<SongSuggestionAdminListItem>

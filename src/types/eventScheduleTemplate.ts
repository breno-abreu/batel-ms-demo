import type { ApiResponse } from '@/types/api'
import type { EventSchedulePage } from '@/types/eventSchedule'

export type EventScheduleTemplateListItem = {
  id: number
  name: string
  description: string | null
  itemCount: number
  createdAt: string
}

export type EventScheduleTemplateItem = {
  id: number
  eventScheduleTemplateId: number
  name: string
  responsiblePersonId: number | null
  responsiblePersonName: string | null
  responsibleAltName: string | null
  responsibleDisplayName: string | null
  startTime: string | null
  durationMinutes: number | null
  notes: string | null
}

export type EventScheduleTemplateDetails = {
  id: number
  name: string
  description: string | null
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  items: EventScheduleTemplateItem[]
}

export type CreateEventScheduleTemplateFromEventRequest = {
  name: string
  description: string | null
}

export type EventScheduleTemplateListResponse = ApiResponse<EventScheduleTemplateListItem[]>
export type EventScheduleTemplateDetailsResponse = ApiResponse<EventScheduleTemplateDetails>
export type EventSchedulePageFromTemplateResponse = ApiResponse<EventSchedulePage>

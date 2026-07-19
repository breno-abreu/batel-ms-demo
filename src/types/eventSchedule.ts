import type { ApiResponse } from '@/types/auth'

export type EventScheduleItem = {
  id: number
  eventId: number
  name: string
  responsiblePersonId: number | null
  responsiblePersonName: string | null
  responsibleAltName: string | null
  responsibleDisplayName: string | null
  startTime: string | null
  durationMinutes: number | null
  notes: string | null
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
}

export type EventSchedulePage = {
  eventId: number
  eventName: string
  eventDate: string
  eventStartTime: string | null
  eventEndTime: string | null
  publicShareHash: string | null
  items: EventScheduleItem[]
}

export type PublicEventScheduleItem = {
  name: string
  responsibleDisplayName: string | null
  startTime: string | null
  durationMinutes: number | null
  notes: string | null
}

export type PublicEventSchedulePage = {
  eventName: string
  eventDate: string
  eventStartTime: string | null
  eventEndTime: string | null
  items: PublicEventScheduleItem[]
}

export type EventScheduleShareLink = {
  shareHash: string
}

export type CreateEventScheduleRequest = {
  name: string
  responsiblePersonId: number | null
  responsibleAltName: string | null
  startTime: string | null
  durationMinutes: number | null
  notes: string | null
}

export type UpdateEventScheduleRequest = CreateEventScheduleRequest

export type EventScheduleFormState = {
  id: number | null
  name: string
  responsiblePersonId: number | null
  responsibleAltName: string
  startTime: string
  durationMinutes: number | null
  notes: string
}

export type EventSchedulePageResponse = ApiResponse<EventSchedulePage>
export type EventScheduleItemResponse = ApiResponse<EventScheduleItem>
export type EventScheduleShareLinkResponse = ApiResponse<EventScheduleShareLink>
export type PublicEventSchedulePageResponse = ApiResponse<PublicEventSchedulePage>

import type { ApiResponse } from '@/types/auth'
import type {
  EventRecurrenceFrequency,
  EventRecurrenceForm,
  EventRecurrenceRequest,
  SeriesEditScope
} from '@/utils/eventRecurrence'

export type { EventRecurrenceFrequency, EventRecurrenceForm, EventRecurrenceRequest, SeriesEditScope }

export type EventType = {
  id: number
  name: string
  displayOrder: number
  linkedEventCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type CreateEventTypeRequest = {
  name: string
}

export type UpdateEventTypeRequest = {
  name: string
}

export type EventTypeResponse = ApiResponse<EventType>
export type EventTypeListResponse = ApiResponse<EventType[]>

export type EventCalendarItem = {
  id: number
  name: string
  description: string | null
  eventTypeId: number
  eventTypeName: string
  ministryId: number | null
  ministryName: string | null
  responsiblePersonId: number | null
  responsiblePersonName: string | null
  eventDate: string
  startTime: string | null
  endTime: string | null
  seriesId: number | null
}

export type EventDetails = EventCalendarItem & {
  createdCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type CreateEventRequest = {
  name: string
  description: string | null
  eventTypeId: number
  ministryId: number | null
  responsiblePersonId: number | null
  eventDate: string
  startTime: string | null
  endTime: string | null
  recurrence?: EventRecurrenceRequest | null
}

export type UpdateEventRequest = {
  name: string
  description: string | null
  eventTypeId: number
  ministryId: number | null
  responsiblePersonId: number | null
  eventDate: string
  startTime: string | null
  endTime: string | null
  scope?: SeriesEditScope
}

export type EventCalendarListResponse = ApiResponse<EventCalendarItem[]>
export type EventDetailsResponse = ApiResponse<EventDetails>

export type EventFormState = {
  id: number | null
  seriesId: number | null
  name: string
  description: string
  eventTypeId: number | null
  ministryId: number | null
  responsiblePersonId: number | null
  eventDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  recurrence: EventRecurrenceForm
}

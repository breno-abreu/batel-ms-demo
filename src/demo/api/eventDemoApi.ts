import {
  demoEventSchedules,
  demoEventScheduleTemplateList,
  demoEventScheduleTemplates,
  demoEvents,
  getDemoMonthlyTeamSchedule,
  getPublicEventSchedule,
  getPublicTeamSchedule,
  toEventCalendarItem
} from '@/demo/data/events'
import { demoRepertoireList } from '@/demo/data/repertoire'
import { demoMutationOk, demoNotFound, demoOk } from '@/demo/demoHelpers'
import type { SeriesEditScope } from '@/types/events'
import type {
  PublicMonthlyTeamScheduleData,
  SaveMonthlyTeamScheduleRequest
} from '@/types/teamSchedules'

export const demoEventApi = {
  listByDateRange: async (start: string, end: string) => {
    const items = demoEvents
      .filter((event) => event.eventDate >= start && event.eventDate <= end)
      .map(toEventCalendarItem)
    return demoOk(items)
  },
  getById: async (id: number) => {
    const event = demoEvents.find((item) => item.id === id)
    return event ? demoOk(event) : demoNotFound()
  },
  create: async () => demoMutationOk(demoEvents[0]),
  update: async (id: number) => {
    const event = demoEvents.find((item) => item.id === id) ?? demoEvents[0]
    return demoMutationOk(event)
  },
  remove: async (..._args: [number, SeriesEditScope?]) => {
    void _args
    return demoMutationOk(null)
  }
}

export const demoEventScheduleApi = {
  listByEvent: async (eventId: number) => {
    const page = demoEventSchedules[eventId]

    if (page) {
      return demoOk(page)
    }

    const event = demoEvents.find((item) => item.id === eventId)

    if (!event) {
      return demoNotFound()
    }

    return demoOk({
      eventId: event.id,
      eventName: event.name,
      eventDate: event.eventDate,
      eventStartTime: event.startTime,
      eventEndTime: event.endTime,
      publicShareHash: null,
      items: []
    })
  },
  create: async (eventId: number) => {
    const page = demoEventSchedules[eventId]
    const item = page?.items[0]

    if (!item) {
      return demoMutationOk({
        id: 1,
        eventId,
        name: 'Item demonstrativo',
        responsiblePersonId: null,
        responsiblePersonName: null,
        responsibleAltName: null,
        responsibleDisplayName: null,
        startTime: '09:00:00',
        durationMinutes: 10,
        notes: null,
        createdAt: new Date().toISOString(),
        createdBy: 1,
        updatedAt: null,
        updatedBy: null
      })
    }

    return demoMutationOk(item)
  },
  update: async (id: number) => {
    const item = Object.values(demoEventSchedules)
      .flatMap((page) => page.items)
      .find((entry) => entry.id === id)

    return item ? demoMutationOk(item) : demoNotFound()
  },
  remove: async () => demoMutationOk(null),
  generateShareLink: async (eventId: number) => {
    const page = demoEventSchedules[eventId]
    return demoMutationOk({
      shareHash: page?.publicShareHash ?? `event-schedule-${eventId}-demo`
    })
  },
  getPublicByShareHash: async (shareHash: string) => {
    const page = getPublicEventSchedule(shareHash)
    return page ? demoOk(page) : demoNotFound()
  }
}

export const demoEventScheduleTemplateApi = {
  list: async () => demoOk([...demoEventScheduleTemplateList]),
  getById: async (id: number) => {
    const template = demoEventScheduleTemplates.find((item) => item.id === id)
    return template ? demoOk(template) : demoNotFound()
  },
  createFromEvent: async () => demoMutationOk(demoEventScheduleTemplates[0]),
  applyToEvent: async (_templateId: number, eventId: number) => {
    return demoEventScheduleApi.listByEvent(eventId)
  },
  remove: async () => demoMutationOk(null)
}

export const demoTeamScheduleApi = {
  getMonthly: async (ministryId: number, year: number, month: number) =>
    demoOk(getDemoMonthlyTeamSchedule(ministryId, year, month)),
  saveMonthly: async (payload: SaveMonthlyTeamScheduleRequest) =>
    demoMutationOk(
      getDemoMonthlyTeamSchedule(payload.ministryId, payload.year, payload.month)
    ),
  generateShareLink: async (_ministryId: number, eventId: number) =>
    demoMutationOk({ shareHash: `team-schedule-${eventId}-demo` }),
  generateMonthlyShareLink: async (ministryId: number, year: number, month: number) =>
    demoMutationOk({ shareHash: `monthly-${ministryId}-${year}-${month}-demo` }),
  getPublicMonthlyByShareHash: async (shareHash: string) => {
    const match = /^monthly-(\d+)-(\d{4})-(\d{1,2})-demo$/.exec(shareHash)

    if (!match) {
      return demoNotFound()
    }

    const monthly = getDemoMonthlyTeamSchedule(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    )
    const payload: PublicMonthlyTeamScheduleData = {
      ministryName: monthly.ministryName,
      isMusicMinistry: monthly.isMusicMinistry,
      year: monthly.year,
      month: monthly.month,
      events: monthly.events.map((event) => {
        const repertoireGroup = monthly.repertoireGroups.find(
          (item) => item.eventId === event.eventId
        )

        return {
          eventName: event.eventName,
          eventDate: event.eventDate,
          startTime: event.startTime,
          endTime: event.endTime,
          assignments: monthly.assignments
            .filter((item) => item.eventId === event.eventId)
            .map(({ displayOrder, personName, skillName }) => ({
              displayOrder,
              personName,
              skillName
            })),
          repertoireGroupName: repertoireGroup?.repertoireGroupName ?? null,
          repertoires: monthly.repertoires
            .filter((item) => item.eventId === event.eventId)
            .map((item) => ({
              displayOrder: item.displayOrder,
              songName: item.songName,
              author: item.author,
              key: item.key,
              musicalThemeName: item.musicalThemeName
            }))
        }
      })
    }

    return demoOk(payload)
  },
  getPublicByShareHash: async (shareHash: string) => {
    const page = getPublicTeamSchedule(shareHash)

    if (!page) {
      return demoNotFound()
    }

    const { repertoireIds, ...publicPayload } = page
    void repertoireIds
    return demoOk(publicPayload)
  },
  listPublicRepertoires: async (shareHash: string) => {
    const page = getPublicTeamSchedule(shareHash)

    if (!page) {
      return demoNotFound()
    }

    const items = demoRepertoireList.filter((item) => page.repertoireIds.includes(item.id))
    return demoOk(items)
  }
}

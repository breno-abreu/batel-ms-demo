import { demoAudit } from '@/demo/demoHelpers'
import { demoEventTypes } from '@/demo/data/catalogs'
import { demoMinistries, demoPeopleDetails } from '@/demo/data/people'
import { demoRepertoireGroups, demoRepertoires } from '@/demo/data/repertoire'
import type { EventCalendarItem, EventDetails } from '@/types/events'
import type {
  EventScheduleItem,
  EventSchedulePage,
  PublicEventSchedulePage
} from '@/types/eventSchedule'
import type {
  EventScheduleTemplateDetails,
  EventScheduleTemplateListItem
} from '@/types/eventScheduleTemplate'
import type { MonthlyTeamScheduleData } from '@/types/teamSchedules'

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

export const demoEvents: EventDetails[] = Array.from({ length: 28 }, (_, index) => {
  const id = index + 1
  const eventType = demoEventTypes[index % demoEventTypes.length]
  const ministry = demoMinistries[index % demoMinistries.length]
  const person = demoPeopleDetails[index % demoPeopleDetails.length]
  const day = ((index * 2) % 27) + 1
  const monthOffset = index % 3 === 0 ? 0 : index % 3 === 1 ? -1 : 1
  let month = currentMonth + monthOffset
  let year = currentYear

  if (month < 1) {
    month = 12
    year -= 1
  }

  if (month > 12) {
    month = 1
    year += 1
  }

  const seriesId = index % 5 === 0 ? 100 + Math.floor(index / 5) : null

  return {
    id,
    name: `${eventType.name} ${id}`,
    description: `Evento demonstrativo de ${eventType.name.toLowerCase()}.`,
    eventTypeId: eventType.id,
    eventTypeName: eventType.name,
    ministryId: ministry.id,
    ministryName: ministry.name,
    responsiblePersonId: person.id,
    responsiblePersonName: person.fullName,
    eventDate: isoDate(year, month, day),
    startTime: index % 2 === 0 ? '09:00:00' : '19:30:00',
    endTime: index % 2 === 0 ? '11:00:00' : '21:00:00',
    seriesId,
    createdCount: seriesId ? 4 : 1,
    ...demoAudit
  }
})

export function toEventCalendarItem(event: EventDetails): EventCalendarItem {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    eventTypeId: event.eventTypeId,
    eventTypeName: event.eventTypeName,
    ministryId: event.ministryId,
    ministryName: event.ministryName,
    responsiblePersonId: event.responsiblePersonId,
    responsiblePersonName: event.responsiblePersonName,
    eventDate: event.eventDate,
    startTime: event.startTime,
    endTime: event.endTime,
    seriesId: event.seriesId
  }
}

function buildScheduleItems(eventId: number): EventScheduleItem[] {
  const names = [
    'Abertura', 'Louvor inicial', 'Oração', 'Mensagem', 'Encerramento'
  ]

  return names.map((name, index) => {
    const person = demoPeopleDetails[(eventId + index) % demoPeopleDetails.length]
    return {
      id: eventId * 10 + index + 1,
      eventId,
      name,
      responsiblePersonId: person.id,
      responsiblePersonName: person.fullName,
      responsibleAltName: null,
      responsibleDisplayName: person.preferredName || person.fullName,
      startTime: `${String(9 + index).padStart(2, '0')}:00:00`,
      durationMinutes: 10 + index * 5,
      notes: index === 1 ? 'Incluir música especial.' : null,
      createdAt: demoAudit.createdAt,
      createdBy: demoAudit.createdBy,
      updatedAt: demoAudit.updatedAt,
      updatedBy: demoAudit.updatedBy
    }
  })
}

export const demoEventSchedules: Record<number, EventSchedulePage> = Object.fromEntries(
  demoEvents.slice(0, 12).map((event) => {
    const isPublic = event.id <= 4
    return [
      event.id,
      {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.eventDate,
        eventStartTime: event.startTime,
        eventEndTime: event.endTime,
        publicShareHash: isPublic ? 'demo' : null,
        items: buildScheduleItems(event.id)
      }
    ]
  })
)

export function getDemoPublicEventSchedule(): PublicEventSchedulePage {
  const page = Object.values(demoEventSchedules)[0]

  return {
    eventName: page.eventName,
    eventDate: page.eventDate,
    eventStartTime: page.eventStartTime,
    eventEndTime: page.eventEndTime,
    items: page.items.map((item) => ({
      name: item.name,
      responsibleDisplayName: item.responsibleDisplayName,
      startTime: item.startTime,
      durationMinutes: item.durationMinutes,
      notes: item.notes
    }))
  }
}

export function getPublicEventSchedule(_shareHash: string): PublicEventSchedulePage | null {
  return getDemoPublicEventSchedule()
}

function toTemplateItems(eventId: number, templateId: number, limit?: number) {
  const source = limit ? buildScheduleItems(eventId).slice(0, limit) : buildScheduleItems(eventId)

  return source.map((item, index) => ({
    id: templateId * 1000 + index + 1,
    eventScheduleTemplateId: templateId,
    name: item.name,
    responsiblePersonId: item.responsiblePersonId,
    responsiblePersonName: item.responsiblePersonName,
    responsibleAltName: item.responsibleAltName,
    responsibleDisplayName: item.responsibleDisplayName,
    startTime: item.startTime,
    durationMinutes: item.durationMinutes,
    notes: item.notes
  }))
}

export const demoEventScheduleTemplates: EventScheduleTemplateDetails[] = [
  {
    id: 1,
    name: 'Culto padrão domingo',
    description: 'Roteiro básico de culto',
    createdAt: demoAudit.createdAt,
    createdBy: demoAudit.createdBy,
    updatedAt: demoAudit.updatedAt,
    updatedBy: demoAudit.updatedBy,
    items: toTemplateItems(1, 1)
  },
  {
    id: 2,
    name: 'Ensaio semanal',
    description: 'Fluxo de ensaio',
    createdAt: demoAudit.createdAt,
    createdBy: demoAudit.createdBy,
    updatedAt: null,
    updatedBy: null,
    items: toTemplateItems(2, 2, 3)
  }
]

export const demoEventScheduleTemplateList: EventScheduleTemplateListItem[] =
  demoEventScheduleTemplates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    itemCount: template.items.length,
    createdAt: template.createdAt
  }))

export function getDemoMonthlyTeamSchedule(
  ministryId: number,
  year: number,
  month: number
): MonthlyTeamScheduleData {
  const ministry = demoMinistries.find((item) => item.id === ministryId) ?? demoMinistries[0]
  const monthEvents = demoEvents
    .filter((event) => {
      const [y, m] = event.eventDate.split('-').map(Number)
      return event.ministryId === ministry.id && y === year && m === month
    })
    .slice(0, 5)

  const events = (monthEvents.length > 0
    ? monthEvents
    : demoEvents.filter((event) => event.ministryId === ministry.id).slice(0, 4)
  ).map((event, index) => ({
    eventId: event.id,
    eventName: event.name,
    eventDate: event.eventDate,
    startTime: event.startTime,
    endTime: event.endTime,
    publicShareHash: index < 2 ? 'demo' : null
  }))

  const people = demoPeopleDetails.filter((person) =>
    person.ministries.some((item) => item.id === ministry.id)
  )

  const assignments = events.flatMap((event) =>
    people.slice(0, 3).map((person, personIndex) => {
      const skill = person.skills[personIndex % person.skills.length]
      return {
        eventId: event.eventId,
        displayOrder: personIndex + 1,
        personId: person.id,
        personName: person.fullName,
        skillId: skill?.id ?? null,
        skillName: skill?.name ?? null
      }
    })
  )

  const repertoires = ministry.isMusicMinistry
    ? events.flatMap((event) =>
      demoRepertoires.slice(0, 3).map((song, index) => ({
        eventId: event.eventId,
        displayOrder: index + 1,
        repertoireId: song.id,
        songName: song.songName,
        author: song.author,
        key: song.key,
        musicalThemeId: song.musicalThemeIds[0] ?? null,
        musicalThemeName: song.musicalThemes[0]?.name ?? null
      }))
    )
    : []

  const repertoireGroups = ministry.isMusicMinistry
    ? events.slice(0, 2).map((event) => ({
      eventId: event.eventId,
      repertoireGroupId: demoRepertoireGroups[0].id,
      repertoireGroupName: demoRepertoireGroups[0].name
    }))
    : []

  return {
    ministryId: ministry.id,
    ministryName: ministry.name,
    isMusicMinistry: ministry.isMusicMinistry,
    year,
    month,
    events,
    columnCount: Math.max(events.length, 1),
    assignments,
    repertoires,
    repertoireGroups
  }
}

export function getDemoPublicTeamSchedule() {
  const ministry = demoMinistries[0]
  const data = getDemoMonthlyTeamSchedule(ministry.id, currentYear, currentMonth)
  const event = data.events[0]

  if (!event) {
    return null
  }

  const eventRepertoires = data.repertoires.filter((item) => item.eventId === event.eventId)
  const eventFolders = data.repertoireGroups.filter((item) => item.eventId === event.eventId)

  return {
    eventName: event.eventName,
    eventDate: event.eventDate,
    startTime: event.startTime,
    endTime: event.endTime,
    ministryName: data.ministryName,
    songCount: eventRepertoires.length,
    usesFolder: eventFolders.length > 0,
    folderName: eventFolders[0]?.repertoireGroupName ?? null,
    repertoireIds: eventRepertoires.map((item) => item.repertoireId)
  }
}

export function getPublicTeamSchedule(_shareHash: string) {
  return getDemoPublicTeamSchedule()
}

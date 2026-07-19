import { formatEventTimeLabel } from '@/utils/eventCalendar'

export type MonthlyScheduleDetailsTab = 'assignment' | 'repertoire'

export type ScheduleEventItem = {
  eventId: number
  eventName: string
  eventDate: string
  startTime: string | null
  endTime: string | null
  publicShareHash?: string | null
}

export const MONTH_OPTIONS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
] as const

export function buildYearOptions(
  centerYear: number,
  range = 2
): number[] {
  const years: number[] = []

  for (let year = centerYear - range; year <= centerYear + range; year += 1) {
    years.push(year)
  }

  return years
}

export function formatMonthYearLabel(year: number, month: number): string {
  const monthLabel = MONTH_OPTIONS.find((option) => option.value === month)?.label ?? String(month)

  return `${monthLabel} de ${year}`
}

export function formatScheduleEventLabel(
  event: ScheduleEventItem,
  options: { includeTime?: boolean } = {}
): string {
  const includeTime = options.includeTime !== false
  const dateLabel = new Date(`${event.eventDate}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  })

  if (!includeTime) {
    return `${dateLabel} — ${event.eventName}`
  }

  const timeLabel = formatEventTimeLabel(event.startTime, event.endTime)

  if (timeLabel) {
    return `${dateLabel} — ${event.eventName} (${timeLabel})`
  }

  return `${dateLabel} — ${event.eventName}`
}

export function formatEventsSummary(events: ScheduleEventItem[]): string {
  const count = events.length

  if (count === 0) {
    return 'Nenhum evento na agenda'
  }

  if (count === 1) {
    return '1 evento na agenda'
  }

  return `${count} eventos na agenda`
}

export const MONTHLY_MUSIC_REPERTOIRE_SLOTS = [
  { displayOrder: 0, label: 'Abertura' },
  { displayOrder: 1, label: 'Oração' },
  { displayOrder: 2, label: 'Ofertório' },
  { displayOrder: 3, label: 'Louvor 1' },
  { displayOrder: 4, label: 'Louvor 2' },
  { displayOrder: 5, label: 'Louvor 3 (Extra)' },
  { displayOrder: 6, label: 'Mensagem Musical' }
] as const

export type MonthlyScheduleRepertoireSlot = (typeof MONTHLY_MUSIC_REPERTOIRE_SLOTS)[number]

const SLOT_MUSICAL_THEME_NAME_BY_DISPLAY_ORDER: Record<number, string> = {
  0: 'Abertura',
  1: 'Oração',
  2: 'Ofertório',
  3: 'Congregacional',
  4: 'Congregacional',
  5: 'Congregacional',
  6: 'Mensagem Musical'
}

export function getMusicalThemeNameForRepertoireSlot(displayOrder: number): string | null {
  return SLOT_MUSICAL_THEME_NAME_BY_DISPLAY_ORDER[displayOrder] ?? null
}

export type MonthlyScheduleRepertoireCell = {
  repertoireId: number
  songName: string
  author: string | null
  key: string | null
  musicalThemeId: number | null
  musicalThemeName: string | null
}

export type MonthlyScheduleRepertoireGroupCell = {
  repertoireGroupId: number
  repertoireGroupName: string
}

export type MonthlyScheduleRepertoireMode = 'standard' | 'folder'

export function buildRepertoireCellKey(eventId: number, displayOrder: number): string {
  return `${eventId}::repertoire-${displayOrder}`
}

export function mapMonthlyRepertoiresToCellState(
  repertoires: Array<{
    eventId: number
    displayOrder: number
    repertoireId: number
    songName: string
    author: string | null
    key: string | null
    musicalThemeId: number | null
    musicalThemeName: string | null
  }>
): Record<string, MonthlyScheduleRepertoireCell> {
  const cellRepertoires: Record<string, MonthlyScheduleRepertoireCell> = {}

  repertoires.forEach((repertoire) => {
    const key = buildRepertoireCellKey(repertoire.eventId, repertoire.displayOrder)

    cellRepertoires[key] = {
      repertoireId: repertoire.repertoireId,
      songName: repertoire.songName,
      author: repertoire.author,
      key: repertoire.key,
      musicalThemeId: repertoire.musicalThemeId,
      musicalThemeName: repertoire.musicalThemeName
    }
  })

  return cellRepertoires
}

export function mapMonthlyRepertoireGroupsToCellState(
  repertoireGroups: Array<{
    eventId: number
    repertoireGroupId: number
    repertoireGroupName: string
  }>
): Record<number, MonthlyScheduleRepertoireGroupCell> {
  const eventRepertoireGroups: Record<number, MonthlyScheduleRepertoireGroupCell> = {}

  repertoireGroups.forEach((group) => {
    eventRepertoireGroups[group.eventId] = {
      repertoireGroupId: group.repertoireGroupId,
      repertoireGroupName: group.repertoireGroupName
    }
  })

  return eventRepertoireGroups
}

export function mapCellRepertoireGroupsToMonthlyPayload(
  eventRepertoireGroups: Record<number, MonthlyScheduleRepertoireGroupCell>
): Array<{
  eventId: number
  repertoireGroupId: number
}> {
  return Object.entries(eventRepertoireGroups).flatMap(([eventIdRaw, group]) => {
    const eventId = Number(eventIdRaw)

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return []
    }

    return [{
      eventId,
      repertoireGroupId: group.repertoireGroupId
    }]
  })
}

export function filterEventRepertoireGroupsForEvents(
  eventRepertoireGroups: Record<number, MonthlyScheduleRepertoireGroupCell>,
  eventIds: number[]
): Record<number, MonthlyScheduleRepertoireGroupCell> {
  const validEventSet = new Set(eventIds)
  const filteredGroups: Record<number, MonthlyScheduleRepertoireGroupCell> = {}

  Object.entries(eventRepertoireGroups).forEach(([eventIdRaw, group]) => {
    const eventId = Number(eventIdRaw)

    if (!Number.isInteger(eventId) || !validEventSet.has(eventId)) {
      return
    }

    filteredGroups[eventId] = group
  })

  return filteredGroups
}

export function deriveEventRepertoireModes(
  repertoires: Array<{ eventId: number }>,
  repertoireGroups: Array<{ eventId: number }>,
  eventIds: number[]
): Record<number, MonthlyScheduleRepertoireMode> {
  const modes: Record<number, MonthlyScheduleRepertoireMode> = {}
  const eventsWithSlots = new Set(repertoires.map((repertoire) => repertoire.eventId))
  const eventsWithFolder = new Set(repertoireGroups.map((group) => group.eventId))

  eventIds.forEach((eventId) => {
    if (eventsWithFolder.has(eventId)) {
      modes[eventId] = 'folder'
      return
    }

    if (eventsWithSlots.has(eventId)) {
      modes[eventId] = 'standard'
    }
  })

  return modes
}

export function clearEventRepertoiresForEvent(
  cellRepertoires: Record<string, MonthlyScheduleRepertoireCell>,
  eventId: number
): Record<string, MonthlyScheduleRepertoireCell> {
  const nextRepertoires = { ...cellRepertoires }

  Object.keys(nextRepertoires).forEach((key) => {
    const [eventIdRaw] = key.split('::')

    if (Number(eventIdRaw) === eventId) {
      delete nextRepertoires[key]
    }
  })

  return nextRepertoires
}

export function eventHasRepertoireSlots(
  cellRepertoires: Record<string, MonthlyScheduleRepertoireCell>,
  eventId: number
): boolean {
  return Object.keys(cellRepertoires).some((key) => {
    const [eventIdRaw] = key.split('::')

    return Number(eventIdRaw) === eventId
  })
}

export function filterRepertoiresByEventMode(
  cellRepertoires: Record<string, MonthlyScheduleRepertoireCell>,
  modes: Record<number, MonthlyScheduleRepertoireMode>
): Record<string, MonthlyScheduleRepertoireCell> {
  return Object.fromEntries(
    Object.entries(cellRepertoires).filter(([key]) => {
      const [eventIdRaw] = key.split('::')
      const eventId = Number(eventIdRaw)

      return Number.isInteger(eventId) && modes[eventId] === 'standard'
    })
  )
}

export function filterEventRepertoireGroupsByMode(
  eventRepertoireGroups: Record<number, MonthlyScheduleRepertoireGroupCell>,
  modes: Record<number, MonthlyScheduleRepertoireMode>
): Record<number, MonthlyScheduleRepertoireGroupCell> {
  return Object.fromEntries(
    Object.entries(eventRepertoireGroups).filter(([eventIdRaw]) => {
      const eventId = Number(eventIdRaw)

      return Number.isInteger(eventId) && modes[eventId] === 'folder'
    })
  )
}

export function mapCellRepertoiresToMonthlyPayload(
  cellRepertoires: Record<string, MonthlyScheduleRepertoireCell>
): Array<{
  eventId: number
  displayOrder: number
  repertoireId: number
  musicalThemeId: number | null
}> {
  return Object.entries(cellRepertoires).flatMap(([key, repertoire]) => {
    const [eventIdRaw, slotKey] = key.split('::')

    if (!eventIdRaw || !slotKey?.startsWith('repertoire-')) {
      return []
    }

    const eventId = Number(eventIdRaw)
    const displayOrder = Number(slotKey.replace('repertoire-', ''))

    if (!Number.isInteger(eventId) || eventId <= 0
      || !Number.isInteger(displayOrder) || displayOrder < 0) {
      return []
    }

    return [{
      eventId,
      displayOrder,
      repertoireId: repertoire.repertoireId,
      musicalThemeId: repertoire.musicalThemeId
    }]
  })
}

export function filterRepertoiresForEvents(
  repertoires: Record<string, MonthlyScheduleRepertoireCell>,
  eventIds: number[]
): Record<string, MonthlyScheduleRepertoireCell> {
  const validEventSet = new Set(eventIds)
  const filteredRepertoires: Record<string, MonthlyScheduleRepertoireCell> = {}

  Object.entries(repertoires).forEach(([key, repertoire]) => {
    const [eventIdRaw] = key.split('::')
    const eventId = Number(eventIdRaw)

    if (!Number.isInteger(eventId) || !validEventSet.has(eventId)) {
      return
    }

    filteredRepertoires[key] = repertoire
  })

  return filteredRepertoires
}

export function filterAssignmentsForEvents(
  assignments: Record<string, MonthlyScheduleCellAssignment>,
  eventIds: number[]
): Record<string, MonthlyScheduleCellAssignment> {
  const validEventSet = new Set(eventIds)
  const filteredAssignments: Record<string, MonthlyScheduleCellAssignment> = {}

  Object.entries(assignments).forEach(([key, assignment]) => {
    const [eventIdRaw, columnId] = key.split('::')

    if (!eventIdRaw || !columnId) {
      return
    }

    const eventId = Number(eventIdRaw)

    if (!Number.isInteger(eventId) || !validEventSet.has(eventId)) {
      return
    }

    filteredAssignments[key] = assignment
  })

  return filteredAssignments
}

export function mapMonthlyAssignmentsToCellState(
  assignments: Array<{
    eventId: number
    displayOrder: number
    personId: number
    personName: string
    skillId: number | null
    skillName: string | null
  }>,
  columns: MonthlyScheduleColumn[]
): Record<string, MonthlyScheduleCellAssignment> {
  const cellAssignments: Record<string, MonthlyScheduleCellAssignment> = {}

  assignments.forEach((assignment) => {
    const column = columns[assignment.displayOrder]

    if (!column) {
      return
    }

    const key = buildCellAssignmentKey(assignment.eventId, column.id)

    cellAssignments[key] = {
      personId: assignment.personId,
      personName: assignment.personName,
      skillId: assignment.skillId,
      skillName: assignment.skillName
    }
  })

  return cellAssignments
}

export function mapCellAssignmentsToMonthlyPayload(
  cellAssignments: Record<string, MonthlyScheduleCellAssignment>,
  columns: MonthlyScheduleColumn[]
): Array<{
  eventId: number
  displayOrder: number
  personId: number
  skillId: number | null
}> {
  return Object.entries(cellAssignments).flatMap(([key, assignment]) => {
    const [eventIdRaw, columnId] = key.split('::')

    if (!eventIdRaw || !columnId) {
      return []
    }

    const eventId = Number(eventIdRaw)
    const displayOrder = columns.findIndex((column) => column.id === columnId)

    if (!Number.isInteger(eventId) || eventId <= 0 || displayOrder < 0) {
      return []
    }

    return [{
      eventId,
      displayOrder,
      personId: assignment.personId,
      skillId: assignment.skillId
    }]
  })
}

export type MonthlyScheduleColumn = {
  id: string
}

export type MonthlyScheduleCellAssignment = {
  personId: number
  personName: string
  skillId: number | null
  skillName: string | null
}

export const INITIAL_MONTHLY_SCHEDULE_COLUMN_COUNT = 5
export const MIN_MONTHLY_SCHEDULE_COLUMN_COUNT = 1

let monthlyScheduleColumnCounter = 0

export function createMonthlyScheduleColumnId(): string {
  monthlyScheduleColumnCounter += 1

  return `monthly-col-${monthlyScheduleColumnCounter}`
}

export function createMonthlyScheduleColumns(
  count = INITIAL_MONTHLY_SCHEDULE_COLUMN_COUNT
): MonthlyScheduleColumn[] {
  return Array.from({ length: count }, () => ({
    id: createMonthlyScheduleColumnId()
  }))
}

export function buildCellAssignmentKey(eventId: number, columnId: string): string {
  return `${eventId}::${columnId}`
}

export function pruneCellAssignments(
  assignments: Record<string, MonthlyScheduleCellAssignment>,
  validEventIds: number[],
  validColumnIds: string[]
): Record<string, MonthlyScheduleCellAssignment> {
  const validEventSet = new Set(validEventIds.map(String))
  const validColumnSet = new Set(validColumnIds)
  const prunedAssignments: Record<string, MonthlyScheduleCellAssignment> = {}

  Object.entries(assignments).forEach(([key, assignment]) => {
    const [eventId, columnId] = key.split('::')

    if (!eventId || !columnId || !validEventSet.has(eventId) || !validColumnSet.has(columnId)) {
      return
    }

    prunedAssignments[key] = assignment
  })

  return prunedAssignments
}

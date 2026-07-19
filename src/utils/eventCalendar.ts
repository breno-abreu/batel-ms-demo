export const AGENDA_START_HOUR = 6
export const AGENDA_END_HOUR = 22
export const AGENDA_HOUR_HEIGHT_PX = 56

export const WEEKDAY_LABELS = ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'] as const

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()

  result.setDate(result.getDate() - day)
  result.setHours(0, 0, 0, 0)

  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)

  return result
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function getAgendaHours(): number[] {
  const hours: number[] = []

  for (let hour = AGENDA_START_HOUR; hour <= AGENDA_END_HOUR; hour += 1) {
    hours.push(hour)
  }

  return hours
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  const startLabel = weekStart.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short'
  })
  const endLabel = weekEnd.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: weekStart.getFullYear() === weekEnd.getFullYear() ? undefined : 'numeric'
  })

  if (weekStart.getMonth() === weekEnd.getMonth() && weekStart.getFullYear() === weekEnd.getFullYear()) {
    return `${weekStart.getDate()} – ${weekEnd.getDate()} de ${weekEnd.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
  }

  return `${startLabel} – ${endLabel}`
}

export function isSameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function parseTimeToMinutes(value: string | null | undefined): number | null {
  if (!value) {
    return null
  }

  const parts = value.split(':')
  const hours = Number(parts[0])
  const minutes = Number(parts[1] ?? 0)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }

  return hours * 60 + minutes
}

export function minutesToTimeInputValue(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59))
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function addMinutesToTime(timeValue: string, minutesToAdd: number): string {
  const baseMinutes = parseTimeToMinutes(timeValue) ?? 0

  return minutesToTimeInputValue(baseMinutes + minutesToAdd)
}

export function getDurationMinutes(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime)
  const end = parseTimeToMinutes(endTime)

  if (start === null || end === null || end <= start) {
    return 60
  }

  return end - start
}

export function snapMinutesFromOffset(offsetY: number): number {
  const rawMinutes = (offsetY / AGENDA_HOUR_HEIGHT_PX) * 60
  const snapped = Math.round(rawMinutes / 30) * 30

  return Math.max(0, Math.min(snapped, (AGENDA_END_HOUR - AGENDA_START_HOUR) * 60))
}

export function getTimeFromGridOffset(offsetY: number): { hour: number; minute: number } {
  const totalMinutes = AGENDA_START_HOUR * 60 + snapMinutesFromOffset(offsetY)
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60

  return {
    hour: Math.min(hour, AGENDA_END_HOUR),
    minute
  }
}

export function getEventBlockStyle(
  startTime: string | null,
  endTime: string | null
): { top: string; height: string } {
  const startMinutes = parseTimeToMinutes(startTime) ?? AGENDA_START_HOUR * 60
  const endMinutes = parseTimeToMinutes(endTime) ?? startMinutes + 60
  const gridStartMinutes = AGENDA_START_HOUR * 60
  const topPx = ((startMinutes - gridStartMinutes) / 60) * AGENDA_HOUR_HEIGHT_PX
  const heightPx = Math.max(((endMinutes - startMinutes) / 60) * AGENDA_HOUR_HEIGHT_PX, 24)

  return {
    top: `${topPx}px`,
    height: `${heightPx}px`
  }
}

export function formatEventTimeLabel(startTime: string | null, endTime: string | null): string {
  const format = (value: string | null) => {
    if (!value) {
      return ''
    }

    return value.slice(0, 5)
  }

  const start = format(startTime)
  const end = format(endTime)

  if (start && end) {
    return `${start} – ${end}`
  }

  return start || end || 'Sem horário'
}

export function getCurrentTimeIndicatorStyle(now: Date): { top: string } | null {
  const minutes = now.getHours() * 60 + now.getMinutes()

  if (minutes < AGENDA_START_HOUR * 60 || minutes > AGENDA_END_HOUR * 60) {
    return null
  }

  const topPx = ((minutes - AGENDA_START_HOUR * 60) / 60) * AGENDA_HOUR_HEIGHT_PX

  return { top: `${topPx}px` }
}

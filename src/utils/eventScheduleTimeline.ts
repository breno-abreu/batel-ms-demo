export type ScheduleTimelineItem = {
  startTime: string | null
  durationMinutes: number | null
}

export type ScheduleNowIndicator = {
  itemIndex: number
  progress: number
}

const MIN_ITEM_HEIGHT_PX = 72
const MAX_ITEM_HEIGHT_PX = 280
const PX_PER_MINUTE = 3.5
const DEFAULT_DURATION_MINUTES = 10

export function getScheduleItemHeightStyle(
  durationMinutes: number | null | undefined
): { minHeight: string } {
  const duration = durationMinutes && durationMinutes > 0
    ? durationMinutes
    : DEFAULT_DURATION_MINUTES
  const heightPx = Math.min(
    MAX_ITEM_HEIGHT_PX,
    Math.max(MIN_ITEM_HEIGHT_PX, duration * PX_PER_MINUTE)
  )

  return { minHeight: `${Math.round(heightPx)}px` }
}

export function parseScheduleTimeToMinutes(value: string | null | undefined): number | null {
  if (!value) {
    return null
  }

  const normalized = value.length >= 5 ? value.slice(0, 5) : value
  const [hoursText, minutesText] = normalized.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null
  }

  return hours * 60 + minutes
}

function isSameLocalDate(eventDate: string, now: Date): boolean {
  const [year, month, day] = eventDate.split('-').map(Number)

  if (!year || !month || !day) {
    return false
  }

  return (
    now.getFullYear() === year
    && now.getMonth() + 1 === month
    && now.getDate() === day
  )
}

function resolveEventWindowMinutes(
  eventStartTime: string | null,
  eventEndTime: string | null,
  items: ScheduleTimelineItem[]
): { start: number; end: number } | null {
  const eventStart = parseScheduleTimeToMinutes(eventStartTime)
  const eventEnd = parseScheduleTimeToMinutes(eventEndTime)

  let rangeStart = eventStart
  let rangeEnd = eventEnd

  const timedItems = items
    .map((item, index) => ({
      index,
      start: parseScheduleTimeToMinutes(item.startTime),
      duration: item.durationMinutes
    }))
    .filter((item): item is { index: number; start: number; duration: number | null } => item.start !== null)

  if (timedItems.length > 0) {
    const firstStart = timedItems[0].start
    const last = timedItems[timedItems.length - 1]
    const lastEnd = last.start + (last.duration && last.duration > 0 ? last.duration : 1)

    if (rangeStart === null || firstStart < rangeStart) {
      rangeStart = firstStart
    }

    if (rangeEnd === null || lastEnd > rangeEnd) {
      rangeEnd = lastEnd
    }
  }

  if (rangeStart === null || rangeEnd === null || rangeEnd <= rangeStart) {
    return null
  }

  return { start: rangeStart, end: rangeEnd }
}

export function isEventHappeningNow(
  eventDate: string,
  eventStartTime: string | null,
  eventEndTime: string | null,
  items: ScheduleTimelineItem[],
  now: Date = new Date()
): boolean {
  if (!isSameLocalDate(eventDate, now)) {
    return false
  }

  const window = resolveEventWindowMinutes(eventStartTime, eventEndTime, items)

  if (!window) {
    return false
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes >= window.start && nowMinutes < window.end
}

export function getActiveScheduleNowIndicator(
  items: ScheduleTimelineItem[],
  eventEndTime: string | null,
  now: Date = new Date()
): ScheduleNowIndicator | null {
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const eventEnd = parseScheduleTimeToMinutes(eventEndTime)

  const ranges = items.map((item, index) => {
    const start = parseScheduleTimeToMinutes(item.startTime)

    if (start === null) {
      return null
    }

    const nextStart = items
      .slice(index + 1)
      .map((next) => parseScheduleTimeToMinutes(next.startTime))
      .find((value): value is number => value !== null)

    let end: number

    if (item.durationMinutes && item.durationMinutes > 0) {
      end = start + item.durationMinutes
    } else if (nextStart !== undefined && nextStart > start) {
      end = nextStart
    } else if (eventEnd !== null && eventEnd > start) {
      end = eventEnd
    } else {
      end = start + 1
    }

    return { index, start, end }
  }).filter((range): range is { index: number; start: number; end: number } => range !== null)

  for (const range of ranges) {
    if (nowMinutes >= range.start && nowMinutes < range.end) {
      const duration = Math.max(range.end - range.start, 1)
      const progress = Math.min(1, Math.max(0, (nowMinutes - range.start) / duration))

      return {
        itemIndex: range.index,
        progress
      }
    }
  }

  return null
}

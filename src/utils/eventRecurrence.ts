export type EventRecurrenceFrequency = 'weekly' | 'every_n_days' | 'monthly'

export type SeriesEditScope = 'thisOnly' | 'thisAndFuture' | 'entireSeries'

export type EventRecurrenceForm = {
  enabled: boolean
  frequency: EventRecurrenceFrequency
  intervalValue: number
  weekdays: number[]
}

export type EventRecurrenceRequest = {
  frequency: EventRecurrenceFrequency
  intervalValue: number
  weekdays: number[] | null
}

/** 0 = domingo … 6 = sábado */
export const WEEKDAY_OPTIONS: { value: number; label: string; shortLabel: string }[] = [
  { value: 0, label: 'Domingo', shortLabel: 'Dom' },
  { value: 1, label: 'Segunda', shortLabel: 'Seg' },
  { value: 2, label: 'Terça', shortLabel: 'Ter' },
  { value: 3, label: 'Quarta', shortLabel: 'Qua' },
  { value: 4, label: 'Quinta', shortLabel: 'Qui' },
  { value: 5, label: 'Sexta', shortLabel: 'Sex' },
  { value: 6, label: 'Sábado', shortLabel: 'Sáb' }
]

export function createEmptyRecurrenceForm(eventDate?: string): EventRecurrenceForm {
  const weekday = eventDate ? weekdayFromDateOnly(eventDate) : new Date().getDay()

  return {
    enabled: false,
    frequency: 'weekly',
    intervalValue: 1,
    weekdays: [weekday]
  }
}

export function weekdayFromDateOnly(dateOnly: string): number {
  const [year, month, day] = dateOnly.split('-').map(Number)
  return new Date(year, month - 1, day).getDay()
}

export function yearEndFromDateOnly(dateOnly: string): string {
  const year = Number(dateOnly.slice(0, 4))
  return Number.isFinite(year) ? `${year}-12-31` : dateOnly
}

export function estimateRecurrenceCount(startDate: string, form: EventRecurrenceForm): number {
  if (!form.enabled || !startDate) {
    return 1
  }

  const dates = generateRecurrenceDates(
    startDate,
    form.frequency,
    Math.max(1, form.intervalValue || 1),
    form.weekdays
  )

  return dates.length
}

export function generateRecurrenceDates(
  startDate: string,
  frequency: EventRecurrenceFrequency,
  intervalValue: number,
  weekdays: number[]
): string[] {
  const endDate = yearEndFromDateOnly(startDate)
  const start = parseDateOnly(startDate)
  const end = parseDateOnly(endDate)
  const dates: string[] = [formatDateOnly(start)]

  if (frequency === 'weekly') {
    const set = new Set(weekdays)
    if (set.size === 0) {
      return dates
    }

    const current = new Date(start)
    current.setDate(current.getDate() + 1)

    while (current <= end) {
      const daysFromStart = Math.floor(
        (current.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
      )
      const weekIndex = Math.floor(daysFromStart / 7)

      if (weekIndex % intervalValue === 0 && set.has(current.getDay())) {
        dates.push(formatDateOnly(current))
      }

      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  if (frequency === 'every_n_days') {
    const current = new Date(start)
    current.setDate(current.getDate() + intervalValue)

    while (current <= end) {
      dates.push(formatDateOnly(current))
      current.setDate(current.getDate() + intervalValue)
    }

    return dates
  }

  const dayOfMonth = start.getDate()
  let year = start.getFullYear()
  let month = start.getMonth() + intervalValue

  while (true) {
    while (month > 11) {
      month -= 12
      year += 1
    }

    if (year > end.getFullYear()) {
      break
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const day = Math.min(dayOfMonth, daysInMonth)
    const candidate = new Date(year, month, day)

    if (candidate > end) {
      break
    }

    if (candidate > start) {
      dates.push(formatDateOnly(candidate))
    }

    month += intervalValue
  }

  return dates
}

export function toRecurrenceRequest(form: EventRecurrenceForm): EventRecurrenceRequest | null {
  if (!form.enabled) {
    return null
  }

  return {
    frequency: 'weekly',
    intervalValue: 1,
    weekdays: form.weekdays.length > 0 ? [...form.weekdays].sort((a, b) => a - b) : null
  }
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateOnly(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

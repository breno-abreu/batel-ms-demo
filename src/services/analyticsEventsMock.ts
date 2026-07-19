import type {
  AnalyticsTimeRange,
  EventAnalytics,
  EventAnalyticsPeriod,
  EventAnalyticsSeries
} from '@/types/analytics'

type MockEventQuery = {
  range: AnalyticsTimeRange
}

const EVENT_TYPES = [
  'Culto',
  'Ensaio',
  'Reunião',
  'Batismo',
  'Escola Sabatina',
  ''
] as const

const MINISTRIES = [
  { id: 1, name: 'Ministério da Música' },
  { id: 2, name: 'Diaconato' },
  { id: 3, name: 'Comunicação' },
  { id: 4, name: 'Recepção' },
  { id: null, name: null }
] as const

function createRng(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function hashRangeSeed(range: AnalyticsTimeRange): number {
  return range.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function resolveRangeStart(range: AnalyticsTimeRange, today: Date): Date | null {
  if (range === 'all') {
    return null
  }

  const months = range === '3m' ? 3 : range === '6m' ? 6 : range === '1y' ? 12 : 60
  return addMonths(today, -months)
}

function monthPeriod(date: Date): EventAnalyticsPeriod {
  const monthStart = startOfMonth(date)
  const label = monthStart
    .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    .replace('.', '')

  return {
    periodKey: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
    label
  }
}

function buildPeriods(rangeStart: Date | null, today: Date): EventAnalyticsPeriod[] {
  const start = startOfMonth(rangeStart ?? addMonths(today, -18))
  const end = startOfMonth(today)
  const periods: EventAnalyticsPeriod[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    periods.push(monthPeriod(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return periods
}

function classifyType(eventType: string): { key: string; label: string } {
  const trimmed = eventType.trim()

  if (!trimmed) {
    return { key: '__none__', label: 'Sem tipo' }
  }

  return { key: trimmed.toLowerCase(), label: trimmed }
}

function classifyMinistry(ministryId: number | null, ministryName: string | null): {
  key: string
  label: string
} {
  if (!ministryId) {
    return { key: '__none__', label: 'Sem ministério' }
  }

  return {
    key: `m:${ministryId}`,
    label: ministryName ?? `Ministério #${ministryId}`
  }
}

function buildSeries(
  buckets: Map<string, { label: string; counts: number[] }>,
  fallbackLabel: string
): EventAnalyticsSeries[] {
  return Array.from(buckets.entries())
    .map(([seriesKey, entry]) => ({
      seriesKey,
      label: entry.label,
      values: entry.counts
    }))
    .sort((a, b) => {
      if (a.label === fallbackLabel) {
        return 1
      }

      if (b.label === fallbackLabel) {
        return -1
      }

      return a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' })
    })
}

export function buildMockEventAnalytics(query: MockEventQuery): EventAnalytics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const rangeStart = resolveRangeStart(query.range, today)
  const periods = buildPeriods(rangeStart, today)
  const rng = createRng(4049 + hashRangeSeed(query.range) * 31)

  const typeBuckets = new Map<string, { label: string; counts: number[] }>()
  const ministryBuckets = new Map<string, { label: string; counts: number[] }>()

  const ensureBucket = (
    map: Map<string, { label: string; counts: number[] }>,
    key: string,
    label: string
  ) => {
    let entry = map.get(key)

    if (!entry) {
      entry = { label, counts: periods.map(() => 0) }
      map.set(key, entry)
    }

    return entry
  }

  periods.forEach((_, periodIndex) => {
    const eventsInMonth = 6 + Math.floor(rng() * 10)

    for (let index = 0; index < eventsInMonth; index += 1) {
      const typeMeta = classifyType(EVENT_TYPES[Math.floor(rng() * EVENT_TYPES.length)] ?? '')
      const ministryPick = MINISTRIES[Math.floor(rng() * MINISTRIES.length)]
      const ministryMeta = classifyMinistry(ministryPick?.id ?? null, ministryPick?.name ?? null)

      ensureBucket(typeBuckets, typeMeta.key, typeMeta.label).counts[periodIndex] += 1
      ensureBucket(ministryBuckets, ministryMeta.key, ministryMeta.label).counts[periodIndex] += 1
    }
  })

  return {
    range: query.range,
    rangeStart: rangeStart ? formatDateOnly(rangeStart) : null,
    rangeEnd: formatDateOnly(today),
    periods,
    byType: buildSeries(typeBuckets, 'Sem tipo'),
    byMinistry: buildSeries(ministryBuckets, 'Sem ministério')
  }
}

export function getMockEventAnalytics(query: MockEventQuery) {
  return Promise.resolve({
    payload: buildMockEventAnalytics(query),
    message: 'Dados de teste de eventos'
  })
}

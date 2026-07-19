import { IS_DEMO_MODE } from '@/demo/demoConfig'
import type {
  AnalyticsAbsencePeriod,
  AnalyticsTimeRange,
  EngagementAnalytics,
  HeatmapCell,
  HeatmapPerson,
  HeatmapMonth,
  InactivePerson,
  NewcomerItem,
  RankingItem,
  UniquePeoplePoint
} from '@/types/analytics'
import type { Ministry } from '@/types/people'

export type MockEngagementQuery = {
  ministryId: number
  range: AnalyticsTimeRange
  absencePeriod: AnalyticsAbsencePeriod
  rankingLimit?: number
}

/** Equivale a IS_DEMO_MODE — não manter true fixo bloqueando a API. */
export const USE_ENGAGEMENT_ANALYTICS_MOCK = IS_DEMO_MODE

export const MOCK_ANALYTICS_MINISTRIES: Ministry[] = [
  {
    id: 9001,
    name: 'Ministério da Música',
    description: 'Demo analytics',
    personIdManager: null,
    managerPersonName: null,
    isActive: true,
    isMusicMinistry: true,
    linkedPersonCount: 24,
    createdAt: '2020-01-01T00:00:00Z',
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null
  },
  {
    id: 9002,
    name: 'Ministério Infantil',
    description: 'Demo analytics',
    personIdManager: null,
    managerPersonName: null,
    isActive: true,
    isMusicMinistry: false,
    linkedPersonCount: 18,
    createdAt: '2020-01-01T00:00:00Z',
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null
  },
  {
    id: 9003,
    name: 'Diaconato',
    description: 'Demo analytics',
    personIdManager: null,
    managerPersonName: null,
    isActive: true,
    isMusicMinistry: false,
    linkedPersonCount: 15,
    createdAt: '2020-01-01T00:00:00Z',
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null
  }
]

type PersonProfile = {
  id: number
  name: string
  /** 0..1 — quanto participa */
  activity: number
  /** meses atrás da primeira participação (null = nunca serviu) */
  firstSeenMonthsAgo: number | null
  /** meses atrás da última participação (null = nunca) */
  lastSeenMonthsAgo: number | null
}

function createRng(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
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

function monthMeta(date: Date): { key: string; label: string; monthStart: string } {
  const monthStart = startOfMonth(date)
  const abbreviated = monthStart
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '')
  const yearShort = String(monthStart.getFullYear()).slice(-2)

  return {
    key: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
    label: `${abbreviated}/${yearShort}`,
    monthStart: formatDateOnly(monthStart)
  }
}

function resolveRangeStart(range: AnalyticsTimeRange, today: Date): Date | null {
  if (range === 'all') {
    return null
  }

  const months = range === '3m' ? 3 : range === '6m' ? 6 : range === '1y' ? 12 : 60
  return addMonths(today, -months)
}

function resolveAbsenceMonths(absencePeriod: AnalyticsAbsencePeriod): number {
  if (absencePeriod === '1m') {
    return 1
  }

  if (absencePeriod === '3m') {
    return 3
  }

  if (absencePeriod === '6m') {
    return 6
  }

  return 12
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

function buildPeople(ministryId: number): PersonProfile[] {
  const firstNames = [
    'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fábio', 'Giovana', 'Hugo',
    'Isabela', 'João', 'Karina', 'Lucas', 'Marina', 'Nicolas', 'Olivia',
    'Paulo', 'Queila', 'Rafael', 'Sofia', 'Tiago', 'Úrsula', 'Vitor',
    'Wagner', 'Yasmin', 'Zeca'
  ]
  const lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Alves',
    'Pereira', 'Gomes', 'Ribeiro', 'Martins', 'Rocha'
  ]

  const rng = createRng(ministryId * 97 + 13)
  const people: PersonProfile[] = []

  for (let index = 0; index < 24; index += 1) {
    const first = firstNames[index % firstNames.length]
    const last = lastNames[(index * 3 + ministryId) % lastNames.length]
    const id = 10000 + ministryId * 100 + index + 1

    // Perfis variados para cada tipo de gráfico
    if (index < 4) {
      // Fiéis: alto ranking, presença contínua
      people.push({
        id,
        name: `${first} ${last}`,
        activity: 0.75 + rng() * 0.2,
        firstSeenMonthsAgo: 36 + Math.floor(rng() * 24),
        lastSeenMonthsAgo: Math.floor(rng() * 2)
      })
      continue
    }

    if (index < 8) {
      // Regulares
      people.push({
        id,
        name: `${first} ${last}`,
        activity: 0.45 + rng() * 0.25,
        firstSeenMonthsAgo: 18 + Math.floor(rng() * 18),
        lastSeenMonthsAgo: Math.floor(rng() * 3)
      })
      continue
    }

    if (index < 12) {
      // Novos (primeira vez nos últimos 6 meses)
      people.push({
        id,
        name: `${first} ${last}`,
        activity: 0.35 + rng() * 0.3,
        firstSeenMonthsAgo: Math.floor(rng() * 5) + 1,
        lastSeenMonthsAgo: Math.floor(rng() * 2)
      })
      continue
    }

    if (index < 16) {
      // Ausentes (última participação há mais de 3–12 meses)
      people.push({
        id,
        name: `${first} ${last}`,
        activity: 0.2 + rng() * 0.2,
        firstSeenMonthsAgo: 20 + Math.floor(rng() * 20),
        lastSeenMonthsAgo: 4 + Math.floor(rng() * 10)
      })
      continue
    }

    if (index < 19) {
      // Nunca serviram (só no ministério)
      people.push({
        id,
        name: `${first} ${last}`,
        activity: 0,
        firstSeenMonthsAgo: null,
        lastSeenMonthsAgo: null
      })
      continue
    }

    // Esporádicos / sazonais
    people.push({
      id,
      name: `${first} ${last}`,
      activity: 0.15 + rng() * 0.25,
      firstSeenMonthsAgo: 8 + Math.floor(rng() * 30),
      lastSeenMonthsAgo: Math.floor(rng() * 6)
    })
  }

  return people
}

function buildUniquePeopleOverTime(
  people: PersonProfile[],
  rangeStart: Date | null,
  today: Date,
  rng: () => number
): UniquePeoplePoint[] {
  const start = rangeStart
    ? new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
    : new Date(today.getFullYear() - 4, today.getMonth(), 1)

  const points: UniquePeoplePoint[] = []
  const cursor = new Date(start)

  while (cursor <= today) {
    const monthIndex = (today.getFullYear() - cursor.getFullYear()) * 12
      + (today.getMonth() - cursor.getMonth())
    const seasonBoost = cursor.getMonth() === 11 || cursor.getMonth() === 3 ? 1.25 : 1
    const growth = 0.7 + Math.min(monthIndex / 48, 1) * 0.5

    let unique = 0
    const selectedNames: string[] = []

    people.forEach((person) => {
      if (person.firstSeenMonthsAgo === null) {
        return
      }

      // Ainda não tinha começado a servir neste mês (olhando para o passado)
      if (person.firstSeenMonthsAgo < monthIndex) {
        return
      }

      // Já tinha parado de servir antes deste mês
      if (person.lastSeenMonthsAgo !== null && monthIndex < person.lastSeenMonthsAgo) {
        return
      }

      const chance = person.activity * seasonBoost * growth * (0.7 + rng() * 0.5)
      if (chance > 0.42) {
        unique += 1
        selectedNames.push(person.name)
      }
    })

    const year = cursor.getFullYear()
    const month = cursor.getMonth() + 1
    const minimumCount = monthIndex < 2 ? 8 : 3

    if (selectedNames.length < minimumCount) {
      const remaining = people
        .filter((person) =>
          person.firstSeenMonthsAgo !== null
          && !selectedNames.includes(person.name))
        .map((person) => person.name)

      while (selectedNames.length < minimumCount && remaining.length > 0) {
        const index = Math.floor(rng() * remaining.length)
        selectedNames.push(remaining.splice(index, 1)[0])
      }
    }

    selectedNames.sort((a, b) => a.localeCompare(b, 'pt-BR'))

    points.push({
      periodKey: `${year}-${String(month).padStart(2, '0')}`,
      label: monthLabel(cursor),
      uniquePeopleCount: Math.max(unique, selectedNames.length, minimumCount),
      personNames: selectedNames
    })

    cursor.setMonth(cursor.getMonth() + 1)
  }

  return points
}

function buildRanking(
  people: PersonProfile[],
  range: AnalyticsTimeRange,
  limit: number,
  rng: () => number
): RankingItem[] {
  const rangeFactor = range === '3m'
    ? 0.3
    : range === '6m'
      ? 0.45
      : range === '1y'
        ? 0.7
        : range === '5y'
          ? 1.1
          : 1.35

  return people
    .filter((person) => person.firstSeenMonthsAgo !== null)
    .map((person) => {
      const base = person.activity * 40 * rangeFactor
      const jitter = rng() * 8
      const count = Math.max(1, Math.round(base + jitter))

      return {
        personId: person.id,
        personName: person.name,
        participationCount: count
      }
    })
    .sort((a, b) => b.participationCount - a.participationCount || a.personName.localeCompare(b.personName))
    .slice(0, limit)
}

function buildNewcomers(
  people: PersonProfile[],
  range: AnalyticsTimeRange,
  today: Date
): NewcomerItem[] {
  const maxMonths = range === '3m'
    ? 3
    : range === '6m'
      ? 6
      : range === '1y'
        ? 12
        : range === '5y'
          ? 60
          : 120

  return people
    .filter((person) =>
      person.firstSeenMonthsAgo !== null
      && person.firstSeenMonthsAgo <= maxMonths)
    .map((person) => {
      const firstDate = addMonths(today, -(person.firstSeenMonthsAgo ?? 0))
      // Espalha um pouco no mês para a linha do tempo não ficar toda no mesmo dia
      firstDate.setDate(Math.min(28, 3 + ((person.id * 7) % 25)))

      return {
        personId: person.id,
        personName: person.name,
        firstParticipationDate: formatDateOnly(firstDate)
      }
    })
    .sort((a, b) =>
      a.firstParticipationDate.localeCompare(b.firstParticipationDate)
      || a.personName.localeCompare(b.personName))
}

function buildInactive(
  people: PersonProfile[],
  absencePeriod: AnalyticsAbsencePeriod,
  today: Date
): InactivePerson[] {
  const absenceMonths = resolveAbsenceMonths(absencePeriod)

  return people
    .filter((person) => {
      if (person.lastSeenMonthsAgo === null) {
        return true
      }

      return person.lastSeenMonthsAgo >= absenceMonths
    })
    .map((person) => {
      if (person.lastSeenMonthsAgo === null) {
        return {
          personId: person.id,
          personName: person.name,
          lastParticipationDate: null,
          daysSinceLastParticipation: absenceMonths * 30 + 15
        }
      }

      const lastDate = addMonths(today, -person.lastSeenMonthsAgo)
      const days = Math.round(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        personId: person.id,
        personName: person.name,
        lastParticipationDate: formatDateOnly(lastDate),
        daysSinceLastParticipation: days
      }
    })
    .sort((a, b) =>
      b.daysSinceLastParticipation - a.daysSinceLastParticipation
      || a.personName.localeCompare(b.personName))
}

function buildHeatmap(
  people: PersonProfile[],
  rangeStart: Date | null,
  today: Date,
  rng: () => number
): {
  heatmapPeople: HeatmapPerson[]
  heatmapMonths: HeatmapMonth[]
  heatmapCells: HeatmapCell[]
} {
  const activePeople = people.filter((person) => person.firstSeenMonthsAgo !== null)
  const heatmapPeople = activePeople.map((person) => ({
    personId: person.id,
    personName: person.name
  }))

  const start = rangeStart ?? addMonths(today, -18)
  const months: HeatmapMonth[] = []
  const cursor = startOfMonth(start)
  const end = startOfMonth(today)

  while (cursor <= end) {
    const meta = monthMeta(cursor)
    months.push({
      monthKey: meta.key,
      label: meta.label,
      monthStart: meta.monthStart
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  // Evita heatmap gigante em "todo o tempo" — limita últimos 60 meses
  const visibleMonths = months.length > 60 ? months.slice(-60) : months
  const cells: HeatmapCell[] = []

  activePeople.forEach((person) => {
    visibleMonths.forEach((month, monthIndex) => {
      const monthsFromEnd = visibleMonths.length - monthIndex
      const stillActive = person.lastSeenMonthsAgo === null
        || person.lastSeenMonthsAgo <= monthsFromEnd + 1
      const alreadyJoined = person.firstSeenMonthsAgo === null
        || person.firstSeenMonthsAgo >= monthsFromEnd - 1

      if (!stillActive || !alreadyJoined) {
        return
      }

      const chance = person.activity * (0.35 + rng() * 0.65)
      if (chance < 0.42) {
        return
      }

      const participationCount = chance > 0.88 ? 4 : chance > 0.72 ? 3 : chance > 0.55 ? 2 : 1
      cells.push({
        personId: person.id,
        monthKey: month.monthKey,
        participationCount
      })
    })
  })

  return {
    heatmapPeople,
    heatmapMonths: visibleMonths,
    heatmapCells: cells
  }
}

export function buildMockEngagementAnalytics(
  query: MockEngagementQuery,
  ministryName = 'Ministério demo'
): EngagementAnalytics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const rangeStart = resolveRangeStart(query.range, today)
  const rng = createRng(query.ministryId * 1009 + hashRangeSeed(query.range) * 17)
  const people = buildPeople(query.ministryId)
  const rankingLimit = Math.min(Math.max(query.rankingLimit ?? 50, 1), 50)
  const newcomers = buildNewcomers(people, query.range, today)
  const heatmap = buildHeatmap(people, rangeStart, today, rng)

  return {
    ministryId: query.ministryId,
    ministryName,
    range: query.range,
    rangeStart: rangeStart ? formatDateOnly(rangeStart) : null,
    rangeEnd: formatDateOnly(today),
    uniquePeopleOverTime: buildUniquePeopleOverTime(people, rangeStart, today, rng),
    ranking: buildRanking(people, query.range, rankingLimit, rng),
    newcomersCount: newcomers.length,
    newcomers,
    inactivePeople: buildInactive(people, query.absencePeriod, today),
    heatmapPeople: heatmap.heatmapPeople,
    heatmapMonths: heatmap.heatmapMonths,
    heatmapCells: heatmap.heatmapCells
  }
}

function hashRangeSeed(range: AnalyticsTimeRange): number {
  if (range === '3m') {
    return 0
  }

  if (range === '6m') {
    return 1
  }

  if (range === '1y') {
    return 2
  }

  if (range === '5y') {
    return 3
  }

  return 4
}

export async function getMockEngagementAnalytics(
  query: MockEngagementQuery,
  ministryName?: string
): Promise<{ payload: EngagementAnalytics }> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250)
  })

  return {
    payload: buildMockEngagementAnalytics(query, ministryName)
  }
}

export async function getMockInactivePeople(
  query: Pick<MockEngagementQuery, 'ministryId' | 'absencePeriod'>
): Promise<{ payload: InactivePerson[] }> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 120)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const people = buildPeople(query.ministryId)

  return {
    payload: buildInactive(people, query.absencePeriod, today)
  }
}

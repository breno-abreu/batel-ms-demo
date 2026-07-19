export type AnalyticsTimeRange = '3m' | '6m' | '1y' | '5y' | 'all'

export type AnalyticsAbsencePeriod = '1m' | '3m' | '6m' | '1y'

export type UniquePeoplePoint = {
  periodKey: string
  label: string
  uniquePeopleCount: number
  personNames: string[]
}

export type RankingItem = {
  personId: number
  personName: string
  participationCount: number
}

export type NewcomerItem = {
  personId: number
  personName: string
  firstParticipationDate: string
}

export type InactivePerson = {
  personId: number
  personName: string
  lastParticipationDate: string | null
  daysSinceLastParticipation: number
}

export type HeatmapPerson = {
  personId: number
  personName: string
}

export type HeatmapMonth = {
  monthKey: string
  label: string
  monthStart: string
}

export type HeatmapCell = {
  personId: number
  monthKey: string
  participationCount: number
}

export type EventAnalyticsPeriod = {
  periodKey: string
  label: string
}

export type EventAnalyticsSeries = {
  seriesKey: string
  label: string
  values: number[]
}

export type EventAnalytics = {
  range: AnalyticsTimeRange
  rangeStart: string | null
  rangeEnd: string
  periods: EventAnalyticsPeriod[]
  byType: EventAnalyticsSeries[]
  byMinistry: EventAnalyticsSeries[]
}

export type EngagementAnalytics = {
  ministryId: number
  ministryName: string
  range: AnalyticsTimeRange
  rangeStart: string | null
  rangeEnd: string
  uniquePeopleOverTime: UniquePeoplePoint[]
  ranking: RankingItem[]
  newcomersCount: number
  newcomers: NewcomerItem[]
  inactivePeople: InactivePerson[]
  heatmapPeople: HeatmapPerson[]
  heatmapMonths: HeatmapMonth[]
  heatmapCells: HeatmapCell[]
}

export type EngagementAnalyticsResponse = {
  payload: EngagementAnalytics
  message?: string
}

export type EventAnalyticsResponse = {
  payload: EventAnalytics
  message?: string
}

export type MusicSongRanking = {
  repertoireId: number
  songName: string
  author: string | null
  playCount: number
}

export type MusicForgottenSong = {
  repertoireId: number
  songName: string
  author: string | null
  lastPlayedDate: string | null
  daysSinceLastPlayed: number
}

export type MusicInterval = {
  repertoireId: number
  songName: string
  author: string | null
  playCount: number
  averageDaysBetweenPlays: number
}

export type MusicHeatmapSong = {
  repertoireId: number
  songName: string
}

export type MusicHeatmapCell = {
  repertoireId: number
  monthKey: string
  playCount: number
}

export type MusicAnalytics = {
  range: AnalyticsTimeRange
  rangeStart: string | null
  rangeEnd: string
  forgottenPeriod: AnalyticsAbsencePeriod
  mostPlayed: MusicSongRanking[]
  leastPlayed: MusicSongRanking[]
  forgottenSongs: MusicForgottenSong[]
  periods: EventAnalyticsPeriod[]
  byTheme: EventAnalyticsSeries[]
  byDifficulty: EventAnalyticsSeries[]
  byPopularity: EventAnalyticsSeries[]
  averageIntervals: MusicInterval[]
  heatmapSongs: MusicHeatmapSong[]
  heatmapMonths: HeatmapMonth[]
  heatmapCells: MusicHeatmapCell[]
}

export type MusicAnalyticsResponse = {
  payload: MusicAnalytics
  message?: string
}

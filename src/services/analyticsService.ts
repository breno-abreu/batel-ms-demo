import {
  getMockEngagementAnalytics,
  getMockInactivePeople
} from '@/services/analyticsEngagementMock'
import { getMockEventAnalytics } from '@/services/analyticsEventsMock'
import { getMockMusicAnalytics } from '@/services/analyticsMusicMock'
import type { AnalyticsAbsencePeriod, AnalyticsTimeRange } from '@/types/analytics'

export type EngagementAnalyticsQuery = {
  ministryId: number
  range: AnalyticsTimeRange
  absencePeriod: AnalyticsAbsencePeriod
  rankingLimit?: number
  ministryName?: string
}

export type EventAnalyticsQuery = {
  range: AnalyticsTimeRange
}

export type MusicAnalyticsQuery = {
  range: AnalyticsTimeRange
  forgottenPeriod: AnalyticsAbsencePeriod
  rankingLimit?: number
}

/** Flags mantidas por compatibilidade com as views de analytics. */
export const USE_ENGAGEMENT_ANALYTICS_MOCK = true
export const USE_EVENT_ANALYTICS_MOCK = true
export const USE_MUSIC_ANALYTICS_MOCK = true

export const analyticsService = {
  async getEngagement(query: EngagementAnalyticsQuery) {
    return getMockEngagementAnalytics(query, query.ministryName)
  },

  async getEvents(query: EventAnalyticsQuery) {
    return getMockEventAnalytics(query)
  },

  async getMusic(query: MusicAnalyticsQuery) {
    return getMockMusicAnalytics(query)
  },

  async getInactivePeople(query: {
    ministryId: number
    absencePeriod: AnalyticsAbsencePeriod
    range?: AnalyticsTimeRange
    ministryName?: string
  }) {
    return getMockInactivePeople({
      ministryId: query.ministryId,
      absencePeriod: query.absencePeriod
    })
  }
}

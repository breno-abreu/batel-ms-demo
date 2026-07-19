import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import {
  getMockEngagementAnalytics,
  getMockInactivePeople,
  USE_ENGAGEMENT_ANALYTICS_MOCK
} from '@/services/analyticsEngagementMock'
import {
  getMockEventAnalytics,
  USE_EVENT_ANALYTICS_MOCK
} from '@/services/analyticsEventsMock'
import {
  getMockMusicAnalytics,
  USE_MUSIC_ANALYTICS_MOCK
} from '@/services/analyticsMusicMock'
import type {
  AnalyticsAbsencePeriod,
  AnalyticsTimeRange,
  EngagementAnalyticsResponse,
  EventAnalyticsResponse,
  InactivePerson,
  MusicAnalyticsResponse
} from '@/types/analytics'
import type { ApiResponse } from '@/types/auth'

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

export {
  USE_ENGAGEMENT_ANALYTICS_MOCK,
  USE_EVENT_ANALYTICS_MOCK,
  USE_MUSIC_ANALYTICS_MOCK
}

export const analyticsService = {
  async getEngagement(query: EngagementAnalyticsQuery) {
    if (IS_DEMO_MODE) {
      return getMockEngagementAnalytics(query, query.ministryName)
    }

    const params = new URLSearchParams({
      ministryId: String(query.ministryId),
      range: query.range,
      absencePeriod: query.absencePeriod,
      rankingLimit: String(query.rankingLimit ?? 50)
    })

    return httpClient.get<ApiResponse<EngagementAnalyticsResponse['payload']>>(
      `/api/analytics/engagement?${params.toString()}`,
      { skipErrorRedirect: true }
    )
  },

  async getEvents(query: EventAnalyticsQuery) {
    if (IS_DEMO_MODE) {
      return getMockEventAnalytics(query)
    }

    const params = new URLSearchParams({
      range: query.range
    })

    return httpClient.get<ApiResponse<EventAnalyticsResponse['payload']>>(
      `/api/analytics/events?${params.toString()}`,
      { skipErrorRedirect: true }
    )
  },

  async getMusic(query: MusicAnalyticsQuery) {
    if (IS_DEMO_MODE) {
      return getMockMusicAnalytics(query)
    }

    const params = new URLSearchParams({
      range: query.range,
      forgottenPeriod: query.forgottenPeriod,
      rankingLimit: String(query.rankingLimit ?? 50)
    })

    return httpClient.get<ApiResponse<MusicAnalyticsResponse['payload']>>(
      `/api/analytics/music?${params.toString()}`,
      { skipErrorRedirect: true }
    )
  },

  async getInactivePeople(query: {
    ministryId: number
    absencePeriod: AnalyticsAbsencePeriod
    range?: AnalyticsTimeRange
    ministryName?: string
  }) {
    if (IS_DEMO_MODE) {
      return getMockInactivePeople({
        ministryId: query.ministryId,
        absencePeriod: query.absencePeriod
      })
    }

    const response = await this.getEngagement({
      ministryId: query.ministryId,
      range: query.range ?? '1y',
      absencePeriod: query.absencePeriod,
      rankingLimit: 50,
      ministryName: query.ministryName
    })

    return {
      payload: (response.payload?.inactivePeople ?? []) as InactivePerson[]
    }
  }
}

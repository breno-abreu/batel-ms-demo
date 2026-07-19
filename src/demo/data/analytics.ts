/**
 * Reexporta os mocks de analytics usados pela demonstração.
 */
export {
  getMockEngagementAnalytics,
  getMockInactivePeople,
  MOCK_ANALYTICS_MINISTRIES
} from '@/services/analyticsEngagementMock'

export { getMockEventAnalytics } from '@/services/analyticsEventsMock'

export { getMockMusicAnalytics } from '@/services/analyticsMusicMock'

export {
  USE_ENGAGEMENT_ANALYTICS_MOCK,
  USE_EVENT_ANALYTICS_MOCK,
  USE_MUSIC_ANALYTICS_MOCK
} from '@/services/analyticsService'

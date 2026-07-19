/**
 * Reexporta os mocks de analytics existentes, controlados por IS_DEMO_MODE
 * através das flags USE_*_ANALYTICS_MOCK.
 */
export {
  getMockEngagementAnalytics,
  getMockInactivePeople,
  MOCK_ANALYTICS_MINISTRIES,
  USE_ENGAGEMENT_ANALYTICS_MOCK
} from '@/services/analyticsEngagementMock'

export {
  getMockEventAnalytics,
  USE_EVENT_ANALYTICS_MOCK
} from '@/services/analyticsEventsMock'

export {
  getMockMusicAnalytics,
  USE_MUSIC_ANALYTICS_MOCK
} from '@/services/analyticsMusicMock'

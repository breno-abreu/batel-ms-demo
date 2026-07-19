import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/repertoire',
      redirect: { name: 'repertoire-list' }
    },
    {
      path: '/repertoire/list',
      name: 'repertoire-list',
      component: () => import('@/views/repertoire/RepertoireListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/repertoire/details/:id',
      name: 'repertoire-details',
      component: () => import('@/views/repertoire/RepertoireDetailsView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/repertoire/groups/:id',
      name: 'repertoire-group-details',
      component: () => import('@/views/repertoire/RepertoireGroupDetailsView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/repertoire/groups',
      name: 'repertoire-groups',
      component: () => import('@/views/repertoire/RepertoireGroupView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/repertoire/difficulty-levels',
      name: 'repertoire-difficulty-levels',
      component: () => import('@/views/repertoire/DifficultyLevelView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/repertoire/popularity-levels',
      name: 'repertoire-popularity-levels',
      component: () => import('@/views/repertoire/PopularityLevelView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/repertoire/musical-themes',
      name: 'repertoire-musical-themes',
      component: () => import('@/views/repertoire/MusicalThemeView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/people',
      redirect: { name: 'people-list' }
    },
    {
      path: '/people/birthdays',
      name: 'people-birthdays',
      component: () => import('@/views/people/BirthdayListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/people/list',
      name: 'people-list',
      component: () => import('@/views/people/PersonListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/people/details/:id',
      name: 'people-details',
      component: () => import('@/views/people/PersonDetailsView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/account/profile',
      name: 'account-profile',
      component: () => import('@/views/people/PersonDetailsView.vue'),
      meta: {
        appShell: true,
        selfProfile: true
      }
    },
    {
      path: '/people/ministries',
      name: 'people-ministries',
      component: () => import('@/views/people/MinistryView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/people/skills',
      name: 'people-skills',
      component: () => import('@/views/people/SkillView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/support',
      name: 'support-tickets',
      component: () => import('@/views/tickets/TicketListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/support/admin',
      name: 'support-admin-tickets',
      component: () => import('@/views/tickets/TicketAdminListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/tickets/statuses',
      name: 'ticket-statuses',
      component: () => import('@/views/tickets/TicketStatusView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/tickets/types',
      name: 'ticket-types',
      component: () => import('@/views/tickets/TicketTypeView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/priorities',
      name: 'priorities',
      component: () => import('@/views/tickets/PriorityView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/requests/task-statuses',
      name: 'task-statuses',
      component: () => import('@/views/requests/WorkTaskStatusView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/requests/purchase-request-statuses',
      name: 'purchase-request-statuses',
      component: () => import('@/views/requests/PurchaseRequestStatusView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/requests/purchases',
      name: 'purchase-requests',
      component: () => import('@/views/requests/PurchaseRequestListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/requests/tasks',
      name: 'tasks',
      component: () => import('@/views/requests/TaskListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/events',
      redirect: { name: 'events-agenda' }
    },
    {
      path: '/events/agenda',
      name: 'events-agenda',
      component: () => import('@/views/events/EventAgendaView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/events/types',
      name: 'event-types',
      component: () => import('@/views/events/EventTypeView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/useful-links',
      redirect: { name: 'useful-link-list' }
    },
    {
      path: '/useful-links/list',
      name: 'useful-link-list',
      component: () => import('@/views/usefulLinks/UsefulLinkListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/useful-links/details/:id',
      name: 'useful-link-details',
      component: () => import('@/views/usefulLinks/UsefulLinkDetailsView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/useful-links/types',
      name: 'useful-link-types',
      component: () => import('@/views/usefulLinks/UsefulLinkTypeView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/useful-links/groups/:id',
      name: 'useful-link-groups-details',
      component: () => import('@/views/usefulLinks/UsefulLinkGroupDetailsView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/useful-links/groups',
      name: 'useful-link-groups',
      component: () => import('@/views/usefulLinks/UsefulLinkGroupView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/events/:eventId/cronograma',
      name: 'events-schedule',
      component: () => import('@/views/events/EventScheduleView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/events/schedules',
      name: 'events-schedules',
      component: () => import('@/views/events/MonthlyTeamScheduleView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/events/schedules/:ministryId/:year/:month',
      name: 'events-schedules-details',
      component: () => import('@/views/events/MonthlyTeamScheduleDetailsView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/cadastros',
      name: 'registrations-hub',
      component: () => import('@/views/registrations/RegistrationsHubView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/analytics',
      redirect: { name: 'analytics-engagement' }
    },
    {
      path: '/analytics/engagement',
      name: 'analytics-engagement',
      component: () => import('@/views/analytics/EngagementAnalyticsView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/analytics/events',
      name: 'analytics-events',
      component: () => import('@/views/analytics/EventAnalyticsView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/analytics/music',
      name: 'analytics-music',
      component: () => import('@/views/analytics/MusicAnalyticsView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/repertoire/song-suggestions',
      name: 'song-suggestion-list',
      component: () => import('@/views/repertoire/SongSuggestionListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/repertoire/song-suggestions/admin',
      name: 'song-suggestion-admin-list',
      component: () => import('@/views/repertoire/SongSuggestionAdminListView.vue'),
      meta: { appShell: true }
    },
    {
      path: '/public/repertorio-pasta/:shareHash',
      name: 'repertoire-group-public',
      component: () => import('@/views/repertoire/RepertoireGroupPublicView.vue'),
      meta: { publicShare: true, hideNavbar: true }
    },
    {
      path: '/public/repertorio-compartilhado/:shareHash',
      redirect: (to) => ({
        name: 'repertoire-group-public',
        params: { shareHash: to.params.shareHash }
      })
    },
    {
      path: '/public/pastas/:shareHash',
      redirect: (to) => ({
        name: 'repertoire-group-public',
        params: { shareHash: to.params.shareHash }
      })
    },
    {
      path: '/public/links-uteis/:shareHash',
      name: 'useful-link-group-public',
      component: () => import('@/views/usefulLinks/UsefulLinkGroupPublicView.vue'),
      meta: { publicShare: true, hideNavbar: true }
    },
    {
      path: '/public/repertorio-escala/:shareHash',
      name: 'team-schedule-public',
      component: () => import('@/views/events/TeamSchedulePublicView.vue'),
      meta: { publicShare: true, hideNavbar: true }
    },
    {
      path: '/public/escalas/:shareHash',
      redirect: (to) => ({
        name: 'team-schedule-public',
        params: { shareHash: to.params.shareHash }
      })
    },
    {
      path: '/public/escalas-mensais/:shareHash',
      name: 'monthly-team-schedule-public',
      component: () => import('@/views/events/MonthlyTeamSchedulePublicView.vue'),
      meta: { publicShare: true, hideNavbar: true }
    },
    {
      path: '/public/cronogramas/:shareHash',
      name: 'event-schedule-public',
      component: () => import('@/views/events/EventSchedulePublicView.vue'),
      meta: { publicShare: true, hideNavbar: true }
    },
    {
      path: '/public/404',
      name: 'public-not-found',
      component: () => import('@/views/errors/PublicNotFoundView.vue'),
      meta: { publicShare: true, hideNavbar: true }
    },
    {
      path: '/public/:pathMatch(.*)*',
      redirect: { name: 'public-not-found' }
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('@/views/errors/NotFoundView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'not-found' }
    }
  ]
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import { Permissions } from '@/utils/permissions'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/repertoire',
      redirect: { name: 'repertoire-list' }
    },
    {
      path: '/repertoire/list',
      name: 'repertoire-list',
      component: () => import('@/views/repertoire/RepertoireListView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RepertoireView] }
    },
    {
      path: '/repertoire/details/:id',
      name: 'repertoire-details',
      component: () => import('@/views/repertoire/RepertoireDetailsView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RepertoireView] }
    },
    {
      path: '/repertoire/groups/:id',
      name: 'repertoire-group-details',
      component: () => import('@/views/repertoire/RepertoireGroupDetailsView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RepertoireGroupsView] }
    },
    {
      path: '/repertoire/groups',
      name: 'repertoire-groups',
      component: () => import('@/views/repertoire/RepertoireGroupView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RepertoireGroupsView] }
    },
    {
      path: '/repertoire/difficulty-levels',
      name: 'repertoire-difficulty-levels',
      component: () => import('@/views/repertoire/DifficultyLevelView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RepertoireMetadataManage] }
    },
    {
      path: '/repertoire/popularity-levels',
      name: 'repertoire-popularity-levels',
      component: () => import('@/views/repertoire/PopularityLevelView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RepertoireMetadataManage] }
    },
    {
      path: '/repertoire/musical-themes',
      name: 'repertoire-musical-themes',
      component: () => import('@/views/repertoire/MusicalThemeView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RepertoireMetadataManage] }
    },
    {
      path: '/people',
      redirect: { name: 'people-list' }
    },
    {
      path: '/people/birthdays',
      name: 'people-birthdays',
      component: () => import('@/views/people/BirthdayListView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.BirthdaysView] }
    },
    {
      path: '/people/list',
      name: 'people-list',
      component: () => import('@/views/people/PersonListView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.PeopleView] }
    },
    {
      path: '/people/details/:id',
      name: 'people-details',
      component: () => import('@/views/people/PersonDetailsView.vue'),
      meta: {
        requiresAuth: true,
        requiredAnyPermissions: [Permissions.PeopleView, Permissions.ProfileViewOwn]
      }
    },
    {
      path: '/account/profile',
      name: 'account-profile',
      component: () => import('@/views/people/PersonDetailsView.vue'),
      meta: {
        requiresAuth: true,
        selfProfile: true,
        requiredPermissions: [Permissions.ProfileViewOwn]
      }
    },
    {
      path: '/people/ministries',
      name: 'people-ministries',
      component: () => import('@/views/people/MinistryView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.MinistriesView] }
    },
    {
      path: '/people/skills',
      name: 'people-skills',
      component: () => import('@/views/people/SkillView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.SkillsView] }
    },
    {
      path: '/support',
      name: 'support-tickets',
      component: () => import('@/views/tickets/TicketListView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.SupportTicketsViewOwn] }
    },
    {
      path: '/support/admin',
      name: 'support-admin-tickets',
      component: () => import('@/views/tickets/TicketAdminListView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.SupportTicketsManageAll] }
    },
    {
      path: '/tickets/statuses',
      name: 'ticket-statuses',
      component: () => import('@/views/tickets/TicketStatusView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RegistrationsManage] }
    },
    {
      path: '/tickets/types',
      name: 'ticket-types',
      component: () => import('@/views/tickets/TicketTypeView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RegistrationsManage] }
    },
    {
      path: '/priorities',
      name: 'priorities',
      component: () => import('@/views/tickets/PriorityView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RegistrationsManage] }
    },
    {
      path: '/requests/task-statuses',
      name: 'task-statuses',
      component: () => import('@/views/requests/WorkTaskStatusView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RegistrationsManage] }
    },
    {
      path: '/requests/purchase-request-statuses',
      name: 'purchase-request-statuses',
      component: () => import('@/views/requests/PurchaseRequestStatusView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.RegistrationsManage] }
    },
    {
      path: '/requests/purchases',
      name: 'purchase-requests',
      component: () => import('@/views/requests/PurchaseRequestListView.vue'),
      meta: {
        requiresAuth: true,
        requiredAnyPermissions: [
          Permissions.PurchaseRequestsViewOwn,
          Permissions.PurchaseRequestsView
        ]
      }
    },
    {
      path: '/requests/tasks',
      name: 'tasks',
      component: () => import('@/views/requests/TaskListView.vue'),
      meta: {
        requiresAuth: true,
        requiredAnyPermissions: [Permissions.TasksViewOwn, Permissions.TasksView]
      }
    },
    {
      path: '/events',
      redirect: { name: 'events-agenda' }
    },
    {
      path: '/events/agenda',
      name: 'events-agenda',
      component: () => import('@/views/events/EventAgendaView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.EventsAgendaView] }
    },
    {
      path: '/events/types',
      name: 'event-types',
      component: () => import('@/views/events/EventTypeView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.EventTypesManage] }
    },
    {
      path: '/useful-links',
      redirect: { name: 'useful-link-list' }
    },
    {
      path: '/useful-links/list',
      name: 'useful-link-list',
      component: () => import('@/views/usefulLinks/UsefulLinkListView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.UsefulLinksView] }
    },
    {
      path: '/useful-links/details/:id',
      name: 'useful-link-details',
      component: () => import('@/views/usefulLinks/UsefulLinkDetailsView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.UsefulLinksView] }
    },
    {
      path: '/useful-links/types',
      name: 'useful-link-types',
      component: () => import('@/views/usefulLinks/UsefulLinkTypeView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.UsefulLinkTypesManage] }
    },
    {
      path: '/useful-links/groups/:id',
      name: 'useful-link-groups-details',
      component: () => import('@/views/usefulLinks/UsefulLinkGroupDetailsView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.UsefulLinkGroupsView] }
    },
    {
      path: '/useful-links/groups',
      name: 'useful-link-groups',
      component: () => import('@/views/usefulLinks/UsefulLinkGroupView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.UsefulLinkGroupsView] }
    },
    {
      path: '/events/:eventId/cronograma',
      name: 'events-schedule',
      component: () => import('@/views/events/EventScheduleView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.EventsAgendaView] }
    },
    {
      path: '/events/schedules',
      name: 'events-schedules',
      component: () => import('@/views/events/MonthlyTeamScheduleView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.TeamSchedulesView] }
    },
    {
      path: '/events/schedules/:ministryId/:year/:month',
      name: 'events-schedules-details',
      component: () => import('@/views/events/MonthlyTeamScheduleDetailsView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.TeamSchedulesView] }
    },
    {
      path: '/cadastros',
      name: 'registrations-hub',
      component: () => import('@/views/registrations/RegistrationsHubView.vue'),
      meta: {
        requiresAuth: true,
        requiredAnyPermissions: [
          Permissions.PeopleView,
          Permissions.MinistriesView,
          Permissions.SkillsView,
          Permissions.RepertoireMetadataManage,
          Permissions.UsefulLinkTypesManage,
          Permissions.EventTypesManage,
          Permissions.RegistrationsManage
        ]
      }
    },
    {
      path: '/admin/permissoes',
      name: 'permissions-admin',
      component: () => import('@/views/admin/PermissionsAdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/analytics',
      redirect: { name: 'analytics-engagement' }
    },
    {
      path: '/analytics/engagement',
      name: 'analytics-engagement',
      component: () => import('@/views/analytics/EngagementAnalyticsView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.AnalyticsView] }
    },
    {
      path: '/analytics/events',
      name: 'analytics-events',
      component: () => import('@/views/analytics/EventAnalyticsView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.AnalyticsView] }
    },
    {
      path: '/analytics/music',
      name: 'analytics-music',
      component: () => import('@/views/analytics/MusicAnalyticsView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.AnalyticsView] }
    },
    {
      path: '/repertoire/song-suggestions',
      name: 'song-suggestion-list',
      component: () => import('@/views/repertoire/SongSuggestionListView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.SongSuggestionsViewOwn] }
    },
    {
      path: '/repertoire/song-suggestions/admin',
      name: 'song-suggestion-admin-list',
      component: () => import('@/views/repertoire/SongSuggestionAdminListView.vue'),
      meta: { requiresAuth: true, requiredPermissions: [Permissions.SongSuggestionsReview] }
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
      path: '/auth/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/401',
      name: 'unauthorized',
      component: () => import('@/views/errors/UnauthorizedView.vue')
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

/** Chaves de permissão alinhadas ao backend (`Permissions.cs`). */
export const Permissions = {
  ProfileViewOwn: 'profile.view_own',
  ProfileManageOwn: 'profile.manage_own',
  BirthdaysView: 'birthdays.view',
  UsefulLinksView: 'useful_links.view',
  UsefulLinkGroupsView: 'useful_link_groups.view',
  UsefulLinkGroupsManageOwn: 'useful_link_groups.manage_own',
  SupportTicketsViewOwn: 'support_tickets.view_own',
  SupportTicketsManageOwn: 'support_tickets.manage_own',
  SongSuggestionsViewOwn: 'song_suggestions.view_own',
  SongSuggestionsManageOwn: 'song_suggestions.manage_own',
  RepertoireView: 'repertoire.view',
  RepertoireGroupsView: 'repertoire_groups.view',
  RepertoireGroupsManageOwn: 'repertoire_groups.manage_own',
  EventsAgendaView: 'events_agenda.view',
  TeamSchedulesView: 'team_schedules.view',
  PurchaseRequestsViewOwn: 'purchase_requests.view_own',
  PurchaseRequestsManageOwn: 'purchase_requests.manage_own',
  TasksViewOwn: 'tasks.view_own',
  TasksManageOwn: 'tasks.manage_own',
  PeopleView: 'people.view',
  PeopleManage: 'people.manage',
  MinistriesView: 'ministries.view',
  MinistriesManage: 'ministries.manage',
  SkillsView: 'skills.view',
  SkillsManage: 'skills.manage',
  UsefulLinksManage: 'useful_links.manage',
  UsefulLinkTypesManage: 'useful_link_types.manage',
  UsefulLinkGroupsManage: 'useful_link_groups.manage',
  RepertoireManage: 'repertoire.manage',
  RepertoireMetadataManage: 'repertoire_metadata.manage',
  RepertoireGroupsManage: 'repertoire_groups.manage',
  SongSuggestionsReview: 'song_suggestions.review',
  PurchaseRequestsView: 'purchase_requests.view',
  TasksView: 'tasks.view',
  AnalyticsView: 'analytics.view',
  EventsAgendaManage: 'events_agenda.manage',
  EventSchedulesManage: 'event_schedules.manage',
  TeamSchedulesManage: 'team_schedules.manage',
  EventTypesManage: 'event_types.manage',
  EventScheduleTemplatesManage: 'event_schedule_templates.manage',
  SupportTicketsManageAll: 'support_tickets.manage_all',
  PurchaseRequestsManageAll: 'purchase_requests.manage_all',
  TasksManageAll: 'tasks.manage_all',
  RegistrationsManage: 'registrations.manage'
} as const

export type PermissionKey = (typeof Permissions)[keyof typeof Permissions]

export function hasPermission(
  isAdmin: boolean,
  permissions: readonly string[] | null | undefined,
  permission: string
): boolean {
  if (isAdmin) {
    return true
  }

  return Boolean(permissions?.includes(permission))
}

export function hasAnyPermission(
  isAdmin: boolean,
  permissions: readonly string[] | null | undefined,
  required: readonly string[]
): boolean {
  if (isAdmin) {
    return true
  }

  if (!required.length) {
    return true
  }

  return required.some((permission) => permissions?.includes(permission))
}

export function hasAllPermissions(
  isAdmin: boolean,
  permissions: readonly string[] | null | undefined,
  required: readonly string[]
): boolean {
  if (isAdmin) {
    return true
  }

  if (!required.length) {
    return true
  }

  return required.every((permission) => permissions?.includes(permission))
}

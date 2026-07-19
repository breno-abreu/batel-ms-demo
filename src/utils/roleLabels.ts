const roleDisplayNames: Record<string, string> = {
  'People Manager': 'Gestor de Pessoas',
  'Content Manager': 'Gestor de Conteúdo',
  'Worship Manager': 'Gestor de Louvor',
  'Request Manager': 'Gestor de Solicitações',
  'Data Analyst': 'Analista de Dados',
  'Event Manager': 'Gestor de Eventos'
}

const roleDescriptions: Record<string, string> = {
  'People Manager':
    'Gerencia o cadastro de pessoas, ministérios e habilidades.',
  'Content Manager':
    'Gerencia links úteis, tipos de link e pastas de links.',
  'Worship Manager':
    'Gerencia o repertório musical, pastas, metadados e revisa sugestões de música.',
  'Request Manager':
    'Acompanha solicitações de compra e tarefas da equipe.',
  'Data Analyst':
    'Consulta as análises e indicadores do sistema.',
  'Event Manager':
    'Gerencia agenda, escalas, cronogramas, tipos de evento e modelos de programação.'
}

const permissionGroupNames: Record<string, string> = {
  profile: 'Perfil',
  birthdays: 'Aniversários',
  useful_links: 'Links úteis',
  useful_link_groups: 'Links úteis',
  useful_link_types: 'Links úteis',
  support_tickets: 'Suporte',
  song_suggestions: 'Sugestões de música',
  repertoire: 'Repertório',
  repertoire_metadata: 'Repertório',
  repertoire_groups: 'Repertório',
  events_agenda: 'Eventos',
  event_schedules: 'Eventos',
  event_schedule_templates: 'Eventos',
  event_types: 'Eventos',
  team_schedules: 'Escalas',
  purchase_requests: 'Solicitações de compra',
  tasks: 'Tarefas',
  people: 'Pessoas',
  ministries: 'Ministérios',
  skills: 'Habilidades',
  analytics: 'Análises',
  registrations: 'Cadastros'
}

const permissionDisplayNames: Record<string, string> = {
  'profile.view_own': 'Ver próprio perfil',
  'profile.manage_own': 'Editar próprio perfil',
  'birthdays.view': 'Ver aniversários',
  'useful_links.view': 'Ver links úteis',
  'useful_links.manage': 'Editar links úteis',
  'useful_link_groups.view': 'Ver pastas de links',
  'useful_link_groups.manage_own': 'Editar pastas de links próprias',
  'useful_link_groups.manage': 'Editar pastas de links',
  'useful_link_types.manage': 'Editar tipos de link útil',
  'support_tickets.view_own': 'Ver próprios tickets de suporte',
  'support_tickets.manage_own': 'Editar próprios tickets de suporte',
  'support_tickets.manage_all': 'Administrar todos os tickets de suporte',
  'song_suggestions.view_own': 'Ver próprias sugestões de música',
  'song_suggestions.manage_own': 'Editar próprias sugestões de música',
  'song_suggestions.review': 'Revisar sugestões de música',
  'repertoire.view': 'Ver repertório',
  'repertoire.manage': 'Editar repertório',
  'repertoire_metadata.manage': 'Editar metadados do repertório',
  'repertoire_groups.view': 'Ver pastas de repertório',
  'repertoire_groups.manage_own': 'Editar pastas de repertório próprias',
  'repertoire_groups.manage': 'Editar pastas de repertório',
  'events_agenda.view': 'Ver agenda',
  'events_agenda.manage': 'Editar agenda',
  'event_schedules.manage': 'Editar cronogramas',
  'event_schedule_templates.manage': 'Editar modelos de cronograma',
  'event_types.manage': 'Editar tipos de evento',
  'team_schedules.view': 'Ver escalas',
  'team_schedules.manage': 'Editar escalas',
  'purchase_requests.view_own': 'Ver próprias solicitações de compra',
  'purchase_requests.manage_own': 'Editar próprias solicitações de compra',
  'purchase_requests.view': 'Ver solicitações de compra',
  'purchase_requests.manage_all': 'Administrar todas as solicitações de compra',
  'tasks.view_own': 'Ver próprias tarefas',
  'tasks.manage_own': 'Editar próprias tarefas',
  'tasks.view': 'Ver tarefas',
  'tasks.manage_all': 'Administrar todas as tarefas',
  'people.view': 'Ver pessoas',
  'people.manage': 'Editar pessoas',
  'ministries.view': 'Ver ministérios',
  'ministries.manage': 'Editar ministérios',
  'skills.view': 'Ver habilidades',
  'skills.manage': 'Editar habilidades',
  'analytics.view': 'Ver análises',
  'registrations.manage': 'Administrar cadastros auxiliares'
}

export function getRoleDisplayName(roleName: string): string {
  if (!roleName) {
    return 'Perfil'
  }

  return roleDisplayNames[roleName] ?? roleName
}

export function getRoleDescription(roleName: string): string {
  if (!roleName) {
    return 'Perfil de acesso com permissões específicas no sistema.'
  }

  return roleDescriptions[roleName] ?? 'Perfil de acesso com permissões específicas no sistema.'
}

export function getPermissionDisplayName(permissionName: string): string {
  if (!permissionName) {
    return 'Permissão'
  }

  return permissionDisplayNames[permissionName] ?? permissionName
}

export function getPermissionGroupName(permissionName: string): string {
  if (!permissionName) {
    return 'Outros'
  }

  const resourceKey = permissionName.split('.')[0] ?? permissionName
  return permissionGroupNames[resourceKey] ?? resourceKey
}

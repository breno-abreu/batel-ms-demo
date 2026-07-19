import type { Component } from 'vue'
import {
  CakeIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  FolderIcon,
  HomeIcon,
  LibraryIcon,
  LifeBuoyIcon,
  LightbulbIcon,
  Link2Icon,
  ListTodoIcon,
  MusicIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  UserIcon,
  UsersRoundIcon
} from '@lucide/vue'
import { registrationRouteNames } from '@/navigation/registrationNavItems'
import { Permissions } from '@/utils/permissions'

export type SidebarNavColorGroup =
  | 'geral'
  | 'eventos'
  | 'musica'
  | 'solicitacoes'
  | 'analises'
  | 'suporte'

export type SidebarNavItem = {
  name: string
  label: string
  description: string
  icon: Component
  activeRouteNames?: string[]
  adminOnly?: boolean
  requiredPermissions?: string[]
  requiredAnyPermissions?: string[]
}

export type SidebarNavGroup = {
  id: SidebarNavColorGroup
  label: string
  items: SidebarNavItem[]
}

export type HomeShortcutItem = SidebarNavItem & {
  colorGroup: SidebarNavColorGroup
}

export type PermissionChecker = {
  isAdmin: boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (required: readonly string[]) => boolean
  hasAllPermissions: (required: readonly string[]) => boolean
}

const registrationHubAnyPermissions = [
  Permissions.PeopleView,
  Permissions.MinistriesView,
  Permissions.SkillsView,
  Permissions.RepertoireMetadataManage,
  Permissions.UsefulLinkTypesManage,
  Permissions.EventTypesManage,
  Permissions.RegistrationsManage
]

function canAccessItem(checker: PermissionChecker, item: SidebarNavItem): boolean {
  if (item.adminOnly && !checker.isAdmin) {
    return false
  }

  if (item.requiredPermissions?.length) {
    if (!checker.hasAllPermissions(item.requiredPermissions)) {
      return false
    }
  }

  if (item.requiredAnyPermissions?.length) {
    if (!checker.hasAnyPermission(item.requiredAnyPermissions)) {
      return false
    }
  }

  return true
}

function buildSidebarNavGroups(): SidebarNavGroup[] {
  return [
    {
      id: 'geral',
      label: 'Geral',
      items: [
        {
          name: 'home',
          label: 'Início',
          description: 'Acesso rápido às principais áreas do Bless App.',
          icon: HomeIcon
        },
        {
          name: 'people-birthdays',
          label: 'Aniversários',
          description: 'Veja os aniversariantes do mês',
          icon: CakeIcon,
          requiredPermissions: [Permissions.BirthdaysView]
        },
        {
          name: 'useful-link-list',
          label: 'Links Úteis',
          description: 'Consulte e gerencie links úteis que não estão ligados com repertório',
          icon: Link2Icon,
          activeRouteNames: ['useful-link-list', 'useful-link-details'],
          requiredPermissions: [Permissions.UsefulLinksView]
        },
        {
          name: 'useful-link-groups',
          label: 'Pastas de Links',
          description: 'Organize links úteis em pastas compartilháveis.',
          icon: FolderIcon,
          activeRouteNames: ['useful-link-groups', 'useful-link-groups-details'],
          requiredPermissions: [Permissions.UsefulLinkGroupsView]
        },
        {
          name: 'registrations-hub',
          label: 'Cadastros',
          description: 'Acesse os cadastros auxiliares do sistema.',
          icon: LibraryIcon,
          activeRouteNames: [
            'registrations-hub',
            'people-details',
            ...registrationRouteNames
          ],
          requiredAnyPermissions: registrationHubAnyPermissions
        },
        {
          name: 'permissions-admin',
          label: 'Permissões',
          description: 'Gerencie as permissões vinculadas aos perfis de acesso.',
          icon: ShieldCheckIcon,
          adminOnly: true
        }
      ]
    },
    {
      id: 'eventos',
      label: 'Eventos',
      items: [
        {
          name: 'events-agenda',
          label: 'Agenda',
          description: 'Visualize e gerencie os eventos da semana.',
          icon: CalendarIcon,
          requiredPermissions: [Permissions.EventsAgendaView]
        },
        {
          name: 'events-schedules',
          label: 'Escalas',
          description: 'Monte e acompanhe as escalas mensais da equipe.',
          icon: UsersRoundIcon,
          activeRouteNames: ['events-schedules', 'events-schedules-details'],
          requiredPermissions: [Permissions.TeamSchedulesView]
        }
      ]
    },
    {
      id: 'musica',
      label: 'Música',
      items: [
        {
          name: 'repertoire-list',
          label: 'Repertório',
          description: 'Consulte e organize o repertório musical.',
          icon: MusicIcon,
          requiredPermissions: [Permissions.RepertoireView]
        },
        {
          name: 'repertoire-groups',
          label: 'Pastas',
          description: 'Acesse as pastas com conjuntos de músicas.',
          icon: FolderIcon,
          requiredPermissions: [Permissions.RepertoireGroupsView]
        },
        {
          name: 'song-suggestion-admin-list',
          label: 'Revisar sugestões',
          description: 'Avalie e gerencie as sugestões enviadas pela equipe.',
          icon: ClipboardCheckIcon,
          requiredPermissions: [Permissions.SongSuggestionsReview]
        },
        {
          name: 'song-suggestion-list',
          label: 'Sugestões de música',
          description: 'Envie e acompanhe sugestões de novas músicas.',
          icon: LightbulbIcon,
          requiredPermissions: [Permissions.SongSuggestionsViewOwn]
        }
      ]
    },
    {
      id: 'solicitacoes',
      label: 'Solicitações',
      items: [
        {
          name: 'purchase-requests',
          label: 'Solicitações de compras',
          description: 'Abra e acompanhe solicitações de compras.',
          icon: ShoppingCartIcon,
          requiredAnyPermissions: [
            Permissions.PurchaseRequestsViewOwn,
            Permissions.PurchaseRequestsView
          ]
        },
        {
          name: 'tasks',
          label: 'Tarefas',
          description: 'Gerencie as tarefas e o andamento das atividades.',
          icon: ListTodoIcon,
          requiredAnyPermissions: [Permissions.TasksViewOwn, Permissions.TasksView]
        }
      ]
    },
    {
      id: 'analises',
      label: 'Análises',
      items: [
        {
          name: 'analytics-engagement',
          label: 'Análise de Engajamento',
          description: 'Acompanhe presença, rankings e engajamento da equipe.',
          icon: UsersRoundIcon,
          requiredPermissions: [Permissions.AnalyticsView]
        },
        {
          name: 'analytics-events',
          label: 'Análise de Eventos',
          description: 'Analise a distribuição de eventos por tipo e ministério.',
          icon: CalendarDaysIcon,
          requiredPermissions: [Permissions.AnalyticsView]
        },
        {
          name: 'analytics-music',
          label: 'Análise de Músicas',
          description: 'Veja rankings e uso das músicas no repertório.',
          icon: MusicIcon,
          requiredPermissions: [Permissions.AnalyticsView]
        }
      ]
    },
    {
      id: 'suporte',
      label: 'Suporte',
      items: [
        {
          name: 'support-admin-tickets',
          label: 'Tickets',
          description: 'Gerencie os tickets de suporte do sistema.',
          icon: LifeBuoyIcon,
          requiredPermissions: [Permissions.SupportTicketsManageAll]
        }
      ]
    }
  ]
}

export function getSidebarNavGroups(checker: PermissionChecker): SidebarNavGroup[] {
  return buildSidebarNavGroups()
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessItem(checker, item))
    }))
    .filter((group) => group.items.length > 0)
}

export function getHomeShortcutItems(checker: PermissionChecker): HomeShortcutItem[] {
  const groups = getSidebarNavGroups(checker)
  const shortcuts: HomeShortcutItem[] = []

  for (const group of groups) {
    if (group.id === 'geral' && checker.hasPermission(Permissions.ProfileViewOwn)) {
      shortcuts.push({
        name: 'account-profile',
        label: 'Meus dados',
        description: 'Visualize e edite suas informações pessoais.',
        icon: UserIcon,
        colorGroup: 'geral',
        requiredPermissions: [Permissions.ProfileViewOwn]
      })
    }

    for (const item of group.items) {
      if (item.name === 'home') {
        continue
      }

      shortcuts.push({
        ...item,
        colorGroup: group.id
      })
    }
  }

  return shortcuts
}

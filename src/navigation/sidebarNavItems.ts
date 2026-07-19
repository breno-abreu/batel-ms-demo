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
  ShoppingCartIcon,
  UserIcon,
  UsersRoundIcon
} from '@lucide/vue'
import { registrationRouteNames } from '@/navigation/registrationNavItems'

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
}

export type SidebarNavGroup = {
  id: SidebarNavColorGroup
  label: string
  items: SidebarNavItem[]
}

export type HomeShortcutItem = SidebarNavItem & {
  colorGroup: SidebarNavColorGroup
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
          icon: CakeIcon
        },
        {
          name: 'useful-link-list',
          label: 'Links Úteis',
          description: 'Consulte e gerencie links úteis que não estão ligados com repertório',
          icon: Link2Icon,
          activeRouteNames: ['useful-link-list', 'useful-link-details']
        },
        {
          name: 'useful-link-groups',
          label: 'Pastas de Links',
          description: 'Organize links úteis em pastas compartilháveis.',
          icon: FolderIcon,
          activeRouteNames: ['useful-link-groups', 'useful-link-groups-details']
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
          ]
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
          icon: CalendarIcon
        },
        {
          name: 'events-schedules',
          label: 'Escalas',
          description: 'Monte e acompanhe as escalas mensais da equipe.',
          icon: UsersRoundIcon,
          activeRouteNames: ['events-schedules', 'events-schedules-details']
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
          icon: MusicIcon
        },
        {
          name: 'repertoire-groups',
          label: 'Pastas',
          description: 'Acesse as pastas com conjuntos de músicas.',
          icon: FolderIcon
        },
        {
          name: 'song-suggestion-admin-list',
          label: 'Revisar sugestões',
          description: 'Avalie e gerencie as sugestões enviadas pela equipe.',
          icon: ClipboardCheckIcon
        },
        {
          name: 'song-suggestion-list',
          label: 'Sugestões de música',
          description: 'Envie e acompanhe sugestões de novas músicas.',
          icon: LightbulbIcon
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
          icon: ShoppingCartIcon
        },
        {
          name: 'tasks',
          label: 'Tarefas',
          description: 'Gerencie as tarefas e o andamento das atividades.',
          icon: ListTodoIcon
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
          icon: UsersRoundIcon
        },
        {
          name: 'analytics-events',
          label: 'Análise de Eventos',
          description: 'Analise a distribuição de eventos por tipo e ministério.',
          icon: CalendarDaysIcon
        },
        {
          name: 'analytics-music',
          label: 'Análise de Músicas',
          description: 'Veja rankings e uso das músicas no repertório.',
          icon: MusicIcon
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
          icon: LifeBuoyIcon
        }
      ]
    }
  ]
}

export function getSidebarNavGroups(): SidebarNavGroup[] {
  return buildSidebarNavGroups()
}

export function getHomeShortcutItems(): HomeShortcutItem[] {
  const groups = getSidebarNavGroups()
  const shortcuts: HomeShortcutItem[] = [
    {
      name: 'account-profile',
      label: 'Meus dados',
      description: 'Visualize e edite suas informações pessoais.',
      icon: UserIcon,
      colorGroup: 'geral'
    }
  ]

  for (const group of groups) {
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

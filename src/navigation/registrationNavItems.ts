import type { Component } from 'vue'
import {
  AwardIcon,
  ChurchIcon,
  CircleDotIcon,
  FlagIcon,
  GaugeIcon,
  ListChecksIcon,
  PaletteIcon,
  ShoppingBagIcon,
  TagsIcon,
  TrendingUpIcon,
  UsersIcon
} from '@lucide/vue'
import { Permissions } from '@/utils/permissions'
import type { PermissionChecker } from '@/navigation/sidebarNavItems'

export type RegistrationColorGroup =
  | 'music'
  | 'people'
  | 'support'
  | 'events'
  | 'links'
  | 'requests'

export type RegistrationNavItem = {
  name: string
  label: string
  description: string
  colorGroup: RegistrationColorGroup
  icon: Component
  requiredPermissions?: string[]
  requiredAnyPermissions?: string[]
}

export const registrationNavItems: RegistrationNavItem[] = [
  {
    name: 'people-list',
    label: 'Pessoas',
    description: 'Cadastre e gerencie as pessoas vinculadas à igreja.',
    colorGroup: 'people',
    icon: UsersIcon,
    requiredPermissions: [Permissions.PeopleView]
  },
  {
    name: 'people-ministries',
    label: 'Ministérios',
    description: 'Mantenha a lista de ministérios disponíveis no sistema.',
    colorGroup: 'people',
    icon: ChurchIcon,
    requiredPermissions: [Permissions.MinistriesView]
  },
  {
    name: 'people-skills',
    label: 'Habilidades',
    description: 'Cadastre habilidades atribuídas às pessoas da equipe.',
    colorGroup: 'people',
    icon: AwardIcon,
    requiredPermissions: [Permissions.SkillsView]
  },
  {
    name: 'repertoire-difficulty-levels',
    label: 'Níveis de Dificuldade',
    description: 'Classifique o nível de dificuldade das músicas do repertório.',
    colorGroup: 'music',
    icon: GaugeIcon,
    requiredPermissions: [Permissions.RepertoireMetadataManage]
  },
  {
    name: 'repertoire-popularity-levels',
    label: 'Níveis de Popularidade',
    description: 'Defina os níveis de popularidade usados no repertório.',
    colorGroup: 'music',
    icon: TrendingUpIcon,
    requiredPermissions: [Permissions.RepertoireMetadataManage]
  },
  {
    name: 'repertoire-musical-themes',
    label: 'Temas Musicais',
    description: 'Organize as músicas por tema e categoria musical.',
    colorGroup: 'music',
    icon: PaletteIcon,
    requiredPermissions: [Permissions.RepertoireMetadataManage]
  },
  {
    name: 'ticket-statuses',
    label: 'Status de Ticket',
    description: 'Configure os status usados no fluxo de tickets de suporte.',
    colorGroup: 'support',
    icon: CircleDotIcon,
    requiredPermissions: [Permissions.RegistrationsManage]
  },
  {
    name: 'ticket-types',
    label: 'Tipos de Ticket',
    description: 'Defina os tipos de solicitação disponíveis no suporte.',
    colorGroup: 'support',
    icon: TagsIcon,
    requiredPermissions: [Permissions.RegistrationsManage]
  },
  {
    name: 'priorities',
    label: 'Prioridades',
    description: 'Defina as prioridades usadas em tarefas e solicitações.',
    colorGroup: 'support',
    icon: FlagIcon,
    requiredPermissions: [Permissions.RegistrationsManage]
  },
  {
    name: 'event-types',
    label: 'Tipos de Evento',
    description: 'Cadastre os tipos de evento usados na agenda e nas escalas.',
    colorGroup: 'events',
    icon: TagsIcon,
    requiredPermissions: [Permissions.EventTypesManage]
  },
  {
    name: 'useful-link-types',
    label: 'Tipos de Link Útil',
    description: 'Organize os links úteis por tipo ou categoria.',
    colorGroup: 'links',
    icon: TagsIcon,
    requiredPermissions: [Permissions.UsefulLinkTypesManage]
  },
  {
    name: 'task-statuses',
    label: 'Status de Tarefa',
    description: 'Configure os status do fluxo de tarefas.',
    colorGroup: 'requests',
    icon: ListChecksIcon,
    requiredPermissions: [Permissions.RegistrationsManage]
  },
  {
    name: 'purchase-request-statuses',
    label: 'Status de Compra',
    description: 'Configure os status das solicitações de compras.',
    colorGroup: 'requests',
    icon: ShoppingBagIcon,
    requiredPermissions: [Permissions.RegistrationsManage]
  }
]

export const registrationRouteNames = registrationNavItems.map((item) => item.name)

export function getAccessibleRegistrationNavItems(
  checker: PermissionChecker
): RegistrationNavItem[] {
  return registrationNavItems.filter((item) => {
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
  })
}

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
}

export const registrationNavItems: RegistrationNavItem[] = [
  {
    name: 'people-list',
    label: 'Pessoas',
    description: 'Cadastre e gerencie as pessoas vinculadas à igreja.',
    colorGroup: 'people',
    icon: UsersIcon
  },
  {
    name: 'people-ministries',
    label: 'Ministérios',
    description: 'Mantenha a lista de ministérios disponíveis no sistema.',
    colorGroup: 'people',
    icon: ChurchIcon
  },
  {
    name: 'people-skills',
    label: 'Habilidades',
    description: 'Cadastre habilidades atribuídas às pessoas da equipe.',
    colorGroup: 'people',
    icon: AwardIcon
  },
  {
    name: 'repertoire-difficulty-levels',
    label: 'Níveis de Dificuldade',
    description: 'Classifique o nível de dificuldade das músicas do repertório.',
    colorGroup: 'music',
    icon: GaugeIcon
  },
  {
    name: 'repertoire-popularity-levels',
    label: 'Níveis de Popularidade',
    description: 'Defina os níveis de popularidade usados no repertório.',
    colorGroup: 'music',
    icon: TrendingUpIcon
  },
  {
    name: 'repertoire-musical-themes',
    label: 'Temas Musicais',
    description: 'Organize as músicas por tema e categoria musical.',
    colorGroup: 'music',
    icon: PaletteIcon
  },
  {
    name: 'ticket-statuses',
    label: 'Status de Ticket',
    description: 'Configure os status usados no fluxo de tickets de suporte.',
    colorGroup: 'support',
    icon: CircleDotIcon
  },
  {
    name: 'ticket-types',
    label: 'Tipos de Ticket',
    description: 'Defina os tipos de solicitação disponíveis no suporte.',
    colorGroup: 'support',
    icon: TagsIcon
  },
  {
    name: 'priorities',
    label: 'Prioridades',
    description: 'Defina as prioridades usadas em tarefas e solicitações.',
    colorGroup: 'support',
    icon: FlagIcon
  },
  {
    name: 'event-types',
    label: 'Tipos de Evento',
    description: 'Cadastre os tipos de evento usados na agenda e nas escalas.',
    colorGroup: 'events',
    icon: TagsIcon
  },
  {
    name: 'useful-link-types',
    label: 'Tipos de Link Útil',
    description: 'Organize os links úteis por tipo ou categoria.',
    colorGroup: 'links',
    icon: TagsIcon
  },
  {
    name: 'task-statuses',
    label: 'Status de Tarefa',
    description: 'Configure os status do fluxo de tarefas.',
    colorGroup: 'requests',
    icon: ListChecksIcon
  },
  {
    name: 'purchase-request-statuses',
    label: 'Status de Compra',
    description: 'Configure os status das solicitações de compras.',
    colorGroup: 'requests',
    icon: ShoppingBagIcon
  }
]

export const registrationRouteNames = registrationNavItems.map((item) => item.name)

export function getAccessibleRegistrationNavItems(): RegistrationNavItem[] {
  return registrationNavItems
}

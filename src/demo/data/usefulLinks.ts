import { demoAudit } from '@/demo/demoHelpers'
import { demoUsefulLinkTypes } from '@/demo/data/catalogs'
import type { UsefulLink } from '@/types/usefulLinks'
import type { UsefulLinkGroup } from '@/types/usefulLinkGroup'

const linkNames = [
  'Manual de Escalas', 'Planilha de Ensaios', 'Drive de Partituras', 'Canal YouTube Louvor',
  'Formulário de Sugestões', 'Calendário Anual', 'Normas da Equipe', 'Tutorial Projeção',
  'Arquivo de Letras', 'Lista de Contatos', 'Kit Novos Membros', 'Guia de Som',
  'Protocolo de Transmissão', 'Biblioteca Hinário', 'Recursos Infantis', 'Material Jovens',
  'Política de Uso', 'Checklist Culto', 'Inventário Instrumentos', 'Agenda de Limpeza',
  'Treinamento Vocal', 'Branding Igreja', 'Mapa do Templo', 'Contatos Emergência',
  'Base de Acordes', 'Banco de Imagens', 'Roteiro Especial', 'Link Zoom Reunião',
  'Pasta Comunicação', 'Site Oficial', 'App de Escalas', 'Canal WhatsApp',
  'Relatório Mensal', 'Planos de Ensaio', 'Kits de Áudio', 'Biblioteca PDF'
]

export const demoUsefulLinks: UsefulLink[] = linkNames.map((name, index) => {
  const type = demoUsefulLinkTypes[index % demoUsefulLinkTypes.length]

  return {
    id: index + 1,
    name,
    usefulLinkTypeId: type.id,
    usefulLinkTypeName: type.name,
    url: `https://example.com/demo/${index + 1}`,
    notes: index % 4 === 0 ? 'Link usado com frequência pela equipe.' : null,
    ...demoAudit
  }
})

const groupNames = [
  'Equipe de Louvor', 'Comunicação', 'Documentos Gerais', 'Treinamentos', 'Externos'
]

export const demoUsefulLinkGroups: UsefulLinkGroup[] = groupNames.map((name, index) => {
  const id = index + 1
  const isPublic = index < 3

  return {
    id,
    name,
    description: `Pasta de links: ${name}`,
    isPublic,
    allowPublicLinkAccess: isPublic,
    hasPublicShareLink: isPublic,
    publicShareHash: isPublic ? 'demo' : null,
    ownerUserId: 1,
    isOwnedByCurrentUser: true,
    itemCount: 5 + index,
    ...demoAudit
  }
})

export const demoUsefulLinkGroupItems: Record<number, number[]> = Object.fromEntries(
  demoUsefulLinkGroups.map((group) => {
    const start = ((group.id - 1) * 5) % demoUsefulLinks.length
    const ids = Array.from({ length: group.itemCount }, (_, offset) => {
      return demoUsefulLinks[(start + offset) % demoUsefulLinks.length].id
    })
    return [group.id, ids]
  })
)

import { demoPeopleDetails } from '@/demo/data/people'
import type {
  SongSuggestionAdminListItem,
  SongSuggestionListItem
} from '@/types/songSuggestion'

const names = [
  'Nova canção de gratidão', 'Hino moderno missões', 'Adoração espontânea',
  'Cântico infantil', 'Louvor acústico', 'Canção de batismo',
  'Especial de Natal', 'Hino clássico revisitado', 'Coral contemporâneo',
  'Música de comunhão', 'Tema juventude', 'Arranjo coral SATB',
  'Instrumental meditação', 'Cântico de esperança', 'Hino do hinário 312',
  'Louvor em inglês', 'Adaptação congregacional', 'Solo soprano',
  'Canção missões locais', 'Medley domingo', 'Nova versão Oceanos',
  'Hino da ceia', 'Música de oferta', 'Cântico abertura',
  'Encerramento solene', 'Tema batismo adultos', 'Especial famílias',
  'Canção pioneiros', 'Hino reformado', 'Louvor uníssono',
  'Adoração noturna', 'Coral juvenil', 'Instrumental piano',
  'Canção testemunho', 'Hino ação de graças', 'Medley clássicos'
]

export const demoSongSuggestionsMine: SongSuggestionListItem[] = names.slice(0, 12).map((name, index) => ({
  id: index + 1,
  name,
  url: index % 2 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
  notes: index % 3 === 0 ? 'Sugestão da congregação.' : null,
  isReviewed: index % 4 === 0,
  adminResponse: index % 4 === 0 ? 'Obrigado! Vamos avaliar no ensaio.' : null,
  createdAt: `2026-04-${String((index % 27) + 1).padStart(2, '0')}T13:00:00.000Z`
}))

export const demoSongSuggestionsAdmin: SongSuggestionAdminListItem[] = names.map((name, index) => {
  const person = demoPeopleDetails[(index % 8) + 1]

  return {
    id: index + 1,
    name,
    url: index % 2 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
    notes: index % 3 === 0 ? 'Sugestão da congregação.' : null,
    isReviewed: index % 3 === 0,
    adminResponse: index % 3 === 0 ? 'Obrigado! Vamos avaliar no ensaio.' : null,
    createdAt: `2026-04-${String((index % 27) + 1).padStart(2, '0')}T13:00:00.000Z`,
    userId: person.id,
    userEmail: person.email ?? `user${person.id}@demo.batelms.app`,
    userFullName: person.fullName,
    updatedAt: index % 3 === 0 ? '2026-05-01T10:00:00.000Z' : null
  }
})

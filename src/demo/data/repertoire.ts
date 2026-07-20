import { demoAudit } from '@/demo/demoHelpers'
import {
  demoDifficultyLevels,
  demoMusicalThemes,
  demoPopularityLevels
} from '@/demo/data/catalogs'
import type { RepertoireDetails, RepertoireListItem } from '@/types/repertoire'
import type { RepertoireGroup } from '@/types/repertoireGroup'

const songNames = [
  'Grande É o Senhor', 'Ao Único', 'Tu És Bom', 'Santo Espírito', 'Quão Grande É o Meu Deus',
  'Hosana', 'Meu Respirar', 'Teu Amor Não Falha', 'Deus de Promessas', 'Em Espírito e Em Verdade',
  'Que Amor É Esse', 'Casa do Pai', 'Agnus Dei', 'Digno de Louvor', 'Yahweh',
  'Tua Graça Me Basta', 'Eu Navegarei', 'Vaso Novo', 'A Ele a Glória', 'Bondade de Deus',
  'Eu Me Rendo', 'Maravilhoso É o Teu Nome', 'Abrigo', 'Canção do Apocalipse', 'Caminho No Deserto',
  'Raridade', 'Ele Virá', 'Espontâneo de Adoração', 'Tudo Posso', 'Minha Casa',
  'Lindo És', 'Oceanos', 'Sonda-me', 'Aliança', 'Rei da Glória', 'Cordeiro e Leão'
]

const authors = [
  'Adhemar de Campos', 'Aline Barros', 'Hillsong', 'Diante do Trono', 'Fernandinho',
  'Gabriela Rocha', 'Isaías Saad', 'Nívea Soares', null
]

const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Am', 'Em']

export const demoRepertoires: RepertoireDetails[] = songNames.map((songName, index) => {
  const id = index + 1
  const difficulty = demoDifficultyLevels[index % demoDifficultyLevels.length]
  const popularity = demoPopularityLevels[index % demoPopularityLevels.length]
  const themeA = demoMusicalThemes[index % demoMusicalThemes.length]
  const themeB = demoMusicalThemes[(index + 3) % demoMusicalThemes.length]
  const themeIds = index % 4 === 0 ? [themeA.id] : [themeA.id, themeB.id]

  return {
    id,
    songName,
    author: authors[index % authors.length],
    version: index % 5 === 0 ? 'Congregacional' : index % 5 === 1 ? 'Coral' : null,
    difficultyLevelId: difficulty.id,
    difficultyLevelName: difficulty.name,
    popularityLevelId: popularity.id,
    popularityLevelName: popularity.name,
    referenceUrl1: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    referenceUrl2: index % 3 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
    playbackUrl: index % 2 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
    lyrics: `${songName}\n\nEstrofe 1\nVerso de demonstração para a música ${songName}.\n\nRefrão\nLouvor e adoração.`,
    chordUrl: index % 2 === 0 ? 'https://example.com/cifras/demo' : null,
    sheetMusicUrl: index % 4 === 0 ? 'https://example.com/partituras/demo' : null,
    key: keys[index % keys.length],
    hymnNumber: index % 6 === 0 ? String(100 + index) : null,
    sopranoKitVoiceUrl: null,
    contraltoKitVoiceUrl: null,
    tenorKitVoiceUrl: null,
    notes: index % 7 === 0 ? 'Usar arranjo suave no verso.' : null,
    isFavorite: index % 5 === 0,
    musicalThemeIds: themeIds,
    musicalThemes: themeIds.map((themeId) => {
      const theme = demoMusicalThemes.find((item) => item.id === themeId)!
      return { id: theme.id, name: theme.name }
    }),
    createdAt: demoAudit.createdAt,
    createdBy: demoAudit.createdBy,
    updatedAt: demoAudit.updatedAt,
    updatedBy: demoAudit.updatedBy
  }
})

export function toRepertoireListItem(item: RepertoireDetails): RepertoireListItem {
  return {
    id: item.id,
    songName: item.songName,
    author: item.author,
    version: item.version,
    key: item.key,
    difficultyLevelName: item.difficultyLevelName,
    popularityLevelName: item.popularityLevelName,
    referenceUrl1: item.referenceUrl1,
    referenceUrl2: item.referenceUrl2,
    playbackUrl: item.playbackUrl,
    lyrics: item.lyrics,
    chordUrl: item.chordUrl,
    sheetMusicUrl: item.sheetMusicUrl,
    sopranoKitVoiceUrl: item.sopranoKitVoiceUrl,
    contraltoKitVoiceUrl: item.contraltoKitVoiceUrl,
    tenorKitVoiceUrl: item.tenorKitVoiceUrl,
    notes: item.notes,
    musicalThemes: item.musicalThemes,
    isFavorite: item.isFavorite
  }
}

export const demoRepertoireList: RepertoireListItem[] = demoRepertoires.map(toRepertoireListItem)

const groupNames = [
  'Culto Domingo', 'Ensaio Semanal', 'Especial Jovens', 'Coral', 'Batismo',
  'Natal 2025', 'Clássicos', 'Novas Músicas'
]

export const demoRepertoireGroups: RepertoireGroup[] = groupNames.map((name, index) => {
  const id = index + 1
  const isPublic = index < 4

  return {
    id,
    name,
    description: `Pasta demonstrativa: ${name}`,
    isPublic,
    allowPublicLinkAccess: isPublic,
    hasPublicShareLink: isPublic,
    publicShareHash: isPublic ? 'demo' : null,
    ownerUserId: 1,
    isOwnedByCurrentUser: true,
    itemCount: 6 + (index % 5),
    ...demoAudit
  }
})

/** Músicas por pasta (ids de repertório). */
export const demoRepertoireGroupItems: Record<number, number[]> = Object.fromEntries(
  demoRepertoireGroups.map((group) => {
    const start = ((group.id - 1) * 4) % demoRepertoires.length
    const ids = Array.from({ length: group.itemCount }, (_, offset) => {
      return demoRepertoires[(start + offset) % demoRepertoires.length].id
    })
    return [group.id, ids]
  })
)

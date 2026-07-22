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

/** Músicas da pasta pública compartilhada (demo BLESS). */
export const demoPublicFolderRepertoires: RepertoireListItem[] = [
  {
    id: 1001,
    songName: 'A Boa Parte',
    author: 'FHOP Music',
    version: 'BLESS',
    key: 'E',
    difficultyLevelName: 'Média',
    popularityLevelName: 'Conhecida fora da IASD',
    referenceUrl1: 'https://youtu.be/dlGOiuxSzVw?si=CRpeYrBQD6SLy81Q',
    referenceUrl2: null,
    playbackUrl: null,
    lyrics: null,
    chordUrl: 'https://drive.google.com/file/d/1gpLxho7eJ6PVlrh-_RPgCmJ9fdseu4N9/view?usp=sharing',
    sheetMusicUrl: null,
    sopranoKitVoiceUrl: 'https://youtu.be/exv83Ff6sMo?si=DNTsi-jXitPubGLU&t=481',
    contraltoKitVoiceUrl: 'https://youtu.be/exv83Ff6sMo?si=4CQkJzeVnR2zGK75&t=384',
    tenorKitVoiceUrl: 'https://youtu.be/EPfzk-iti6Q?si=LrxVfVq92hdHZpSQ&t=38',
    notes: null,
    musicalThemes: [
      { id: 101, name: 'Worship' },
      { id: 102, name: 'Emocional' }
    ],
    isFavorite: false
  },
  {
    id: 1002,
    songName: 'Algo Novo',
    author: 'Kemuel',
    version: 'BLESS',
    key: 'C',
    difficultyLevelName: 'Fácil',
    popularityLevelName: 'Muito popular fora da IASD',
    referenceUrl1: 'https://youtu.be/wWU1Bn6wy9o?si=qziZbrfOCCa5AgkF',
    referenceUrl2: null,
    playbackUrl: null,
    lyrics: null,
    chordUrl: 'https://drive.google.com/file/d/1L3M26tDpVHrWk9WNvowKEnlh9OVVFtz0/view?usp=sharing',
    sheetMusicUrl: null,
    sopranoKitVoiceUrl: 'https://youtu.be/XX00lnNIRLQ?si=ouKabIfLcb9vtd3a&t=562',
    contraltoKitVoiceUrl: 'https://youtu.be/XX00lnNIRLQ?si=QDxvwl9gkCjdrXfn&t=301',
    tenorKitVoiceUrl: 'https://youtu.be/XX00lnNIRLQ?si=KFS2GPIEbEVHuUNm',
    notes: null,
    musicalThemes: [
      { id: 101, name: 'Worship' },
      { id: 103, name: 'Incremental' }
    ],
    isFavorite: false
  },
  {
    id: 1003,
    songName: 'Eu Sou Teu',
    author: 'Celebra SP',
    version: 'BLESS',
    key: 'F',
    difficultyLevelName: 'Média',
    popularityLevelName: 'Conhecida dentro da IASD',
    referenceUrl1: 'https://youtu.be/kc9MbHxUHwg?si=w1cofKtBEToTkfZt',
    referenceUrl2: null,
    playbackUrl: null,
    lyrics: null,
    chordUrl: 'https://drive.google.com/file/d/1u_Z1Zm6hNFi97kJEcqzcAL4ayGlDxqdF/view?usp=sharing',
    sheetMusicUrl: null,
    sopranoKitVoiceUrl: 'https://youtu.be/Dv1zN-gH64Q?si=SPMglXU5KVXTPQ9m',
    contraltoKitVoiceUrl: 'https://youtu.be/vI_3zw1UXzs?si=JfGbV0X257-1Qq8A',
    tenorKitVoiceUrl: 'https://youtu.be/aNOFQrQKKWQ?si=De6mX9LnbpEX949t',
    notes: null,
    musicalThemes: [
      { id: 104, name: 'Pop/Rock' },
      { id: 105, name: 'Animada' }
    ],
    isFavorite: false
  },
  {
    id: 1004,
    songName: 'Me Ama',
    author: 'Diante do Trono',
    version: 'BLESS',
    key: 'A',
    difficultyLevelName: 'Fácil',
    popularityLevelName: 'Popular',
    referenceUrl1: 'https://youtu.be/-go3Gt5TdmE?si=u1OOKzCQc_e-JrLH',
    referenceUrl2: null,
    playbackUrl: null,
    lyrics: null,
    chordUrl: 'https://drive.google.com/file/d/1PqpKgY2t2PHOzhEWQSsSMm7ApRB9oaDs/view?usp=sharing',
    sheetMusicUrl: null,
    sopranoKitVoiceUrl: 'https://youtu.be/vv1RbxmNc04?si=H69ILSbDcFXeH3Fv&t=364',
    contraltoKitVoiceUrl: 'https://youtu.be/vv1RbxmNc04?si=cHO4ilx9JU1HTse2&t=209',
    tenorKitVoiceUrl: 'https://youtu.be/ySpR32x9g2E?si=Lpx6wmCqsSGgbifH&t=140',
    notes: null,
    musicalThemes: [
      { id: 101, name: 'Worship' },
      { id: 102, name: 'Emocional' }
    ],
    isFavorite: false
  },
  {
    id: 1005,
    songName: 'Na Casa',
    author: 'Nova Semente',
    version: 'BLESS',
    key: 'D',
    difficultyLevelName: 'Fácil',
    popularityLevelName: 'Conhecida',
    referenceUrl1: 'https://youtu.be/MpTuFJHaBg8?si=kyGEozyxZ7UpUqHV',
    referenceUrl2: null,
    playbackUrl: null,
    lyrics: null,
    chordUrl: 'https://drive.google.com/file/d/16ua0kUfSilFk3GNWDSLQi2IHUyLxdkcW/view?usp=sharing',
    sheetMusicUrl: null,
    sopranoKitVoiceUrl: 'https://youtu.be/LPw-bCs0vuM?si=Fss3OATW3fxQ29w7',
    contraltoKitVoiceUrl: null,
    contraltoKitUnavailable: true,
    tenorKitVoiceUrl: 'https://youtu.be/qVPTuAmPFM0?si=Xx1x6EJ8tYdJUB2b',
    notes: null,
    musicalThemes: [
      { id: 101, name: 'Worship' },
      { id: 103, name: 'Incremental' }
    ],
    isFavorite: false
  }
]

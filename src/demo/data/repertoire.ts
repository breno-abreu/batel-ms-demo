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
const A_BOA_PARTE_LYRICS = `Precioso Deus
Aos Teus pés aqui estou
O que eu poderia Te oferecer
Por tudo o que Tu és

Tudo o que tenho
Eu derramo aos Teus pés
Não importa o quanto custou
Jesus, Teu valor é maior

Eu encontrei o meu tesouro
Eu encontrei o bem mais precioso
Eu encontrei o meu tesouro
Eu encontrei o bem mais precioso

(Interlúdio)

Precioso Deus
Tuas palavras são mais desejáveis
Tuas palavras são mais desejáveis
Que o mais doce mel

Tudo o que tenho
Eu derramo aos Teus pés
Não importa o quanto custou
Jesus, Teu valor é maior
Jesus, Teu valor é maior

Eu encontrei o meu tesouro
Eu encontrei o bem mais precioso
Eu encontrei o meu tesouro
Eu encontrei o bem mais precioso

(Interlúdio)

Como Maria, que estava aos Teus pés
E dissestes a ela: essa é a boa parte
Que nunca, nunca será tirada

Como Maria, que estava aos Teus pés
E dissestes a ela: essa é a boa parte
Que nunca, nunca será tirada

Como Maria, que estava aos Teus pés
E dissestes a ela: essa é a boa parte
Que nunca, nunca será tirada

Como Maria, que estava aos Teus pés
E dissestes a ela: essa é a boa parte
Que nunca, nunca será tirada

Eu encontrei o meu tesouro
Eu encontrei o bem mais precioso
Eu encontrei o meu tesouro
Eu encontrei o bem mais precioso

Como Maria, que estava aos Teus pés
E dissestes a ela: essa é a boa parte
Que nunca, nunca será tirada

Como Maria, que estava aos Teus pés
E dissestes a ela: essa é a boa parte
Que nunca, nunca será tirada

Como Maria, que estava aos Teus pés
E dissestes a ela: essa é a boa parte
Que nunca, nunca será tirada

Como Maria, que estava aos Teus pés
E dissestes a ela: essa é a boa parte
Que nunca, nunca será tirada

Eu encontrei o meu tesouro
Eu encontrei o bem mais precioso
Eu encontrei o meu tesouro
Eu encontrei o bem mais precioso`

const EU_SOU_TEU_LYRICS = `Onde me mandares ir, eu sigo
Tudo que o Senhor disser, repito
Já não vivo eu, sou inteiramente teu

Se não for do teu querer, eu nego
Cada plano em tuas mãos, entrego
Já não vivo eu, sou inteiramente teu

E nada vai me afastar
Estou seguro em tuas mãos, Jesus

E eu sou teu, não sou de mais ninguem
O teu amor me alcançou
E devolveu o meu valor
Eu volto a dizer, sou teu
E pra sempre assim serei

(Interlúdio)

Onde me mandares ir, eu sigo
Tudo que o Senhor disser, repito
Já não vivo eu, sou inteiramente teu

Se não for do teu querer, eu nego
Cada plano em tuas mãos, entrego
Já não vivo eu, sou inteiramente teu

E nada vai me afastar
Estou seguro em tuas mãos, Jesus

E eu sou teu, não sou de mais ninguem
O teu amor me alcançou
E devolveu o meu valor
Eu volto a dizer, sou teu
E pra sempre assim serei

Não sou de mais ninguém
O teu mor me alcançou
E devolveu o meu valor
Eu volto a dizer, sou teu
E pra sempre assim serei

(Interlúdio)

Onde me mandares ir ...
Tudo que o Senhor disser...
Já não vivo eu, sou inteiramente...
Teu`

const ALGO_NOVO_LYRICS = `Eu quero viver algo novo
Faz meu coração arder de novo

Fazendo todo medo desaparecer
Trazendo sobre mim um novo amanhecer
Eu quero viver algo novo

Vem me visitar hoje aqui
Quero conhecer mais de Ti

Espírito, vem, Espírito, vem
Espírito Santo
Espírito, vem, Espírito, vem
Espírito Santo

Eu quero viver algo novo
Faz meu coração arder de novo

Fazendo todo medo desaparecer
Trazendo sobre mim um novo amanhecer
Eu quero viver algo novo

Vem me visitar hoje aqui
Quero conhecer mais de Ti

Espírito, vem, Espírito, vem
Espírito Santo
Espírito, vem, Espírito, vem
Espírito Santo

Espírito, vem, Espírito, vem
Espírito Santo
Espírito, vem, Espírito, vem
Espírito Santo

Eu quero viver algo novo
Faz meu coração arder de novo

Fazendo todo medo desaparecer
Trazendo sobre mim um novo amanhecer
Eu quero viver algo novo

Eu quero viver algo novo
Faz meu coração arder de novo

Fazendo todo medo desaparecer
Trazendo sobre mim um novo amanhecer
Eu quero viver algo novo

Ohhh... ohhh... ohhh... ohhh
Ohhh... ohhh... ohhh... ohhh

Ohhh... ohhh... ohhh... ohhh
Ohhh... ohhh... ohhh... ohhh

Santo Espírito, desce como fogo
Santo Espírito, desce como fogo
Incendeia, incendeia

Santo Espírito, desce como fogo
Santo Espírito, desce como fogo
Incendeia, incendeia

Santo Espírito, desce como fogo
Santo Espírito, desce como fogo
Incendeia, incendeia

Santo Espírito, desce como fogo
Santo Espírito, desce como fogo
Incendeia, incendeia

Eu quero viver algo novo
Faz meu coração arder de novo

Fazendo todo medo desaparecer
Trazendo sobre mim um novo amanhecer
Eu quero viver algo novo`

const ME_AMA_LYRICS = `Tem ciúmes de mim
O Seu amor é como um furacão
E eu me rendo ao vento de Sua misericórdia

Então, de repente
Não vejo mais minhas aflições
Eu só vejo a glória
E percebo quão maravilhoso Ele é
E o tanto que Ele me quer

Ô, Ele me amou
Ô, Ele me ama
Ele me amou

(Interlúdio)

Tem ciúmes de mim
O Seu amor é como um furacão
E eu me rendo ao vento de Sua misericórdia

Então, de repente
Não vejo mais minhas aflições
Eu só vejo a glória
E percebo quão maravilhoso Ele é
E o tanto que Ele me quer

Ô, Ele me amou
Ô, Ele me ama
Ele me amou

(Interlúdio)

Me ama, Ele me ama
Ele me ama, Ele me ama
Me ama, Ele me ama
Ele me ama, Ele me ama

Somos Sua herança
E Ele é o nosso galardão
Seu olhar de graça
Nos atrai à redenção

Se a graça é um oceano
Estamos afogando
O céu se une à terra
Como um beijo apaixonado

Meu coração dispara
Em meu peito, acelerado
Não tenho tempo pra perder
Com ressentimentos
Quando penso que Ele

Me ama, Ele me ama
Ele me ama, Ele me ama
Me ama, Ele me ama
Ele me ama, Ele me ama

Me ama, Ele me ama
Ele me ama, Ele me ama
Me ama, Ele me ama
Ele me ama, Ele me ama

(Interlúdio)

Oh, Ele me amou
Oh, Ele me ama, Ele me amou
Oh, Ele me amou
Oh, Ele me ama, Ele me amou`

const NA_CASA_LYRICS = `Fui convidado à mesa
Larguei minhas defesas
E vim reconhecer
Não merecia estar aqui

Comigo eu trouxe amigos
Felizes ou feridos
Gente que escutou
Esse chamado e aceitou

E é tão bom saber que há
Lugar aqui
A graça nos chamou pra mesa
Do Senhor

Há lugar na casa
Há perdão na casa
Quando estamos juntos
Nosso encontro é casa de Deus Pai

Há esperança na casa
Recomeço na casa
Reunidos Nele
Nosso encontro é casa de Deus Pai

(Interlúdio)

O som da Sua palavra
Curou a nossa alma
O Verbo nos amou
Da solidão nos resgatou

E é tão bom saber que há
Lugar aqui
A graça nos chamou pra mesa
Do Senhor

Há lugar na casa
Há perdão na casa
Quando estamos juntos
Nosso encontro é casa de Deus Pai

Há esperança na casa
Recomeço na casa
Reunidos Nele
Nosso encontro é casa de Deus Pai

Há lugar na casa
Há perdão na casa
Quando estamos juntos
Nosso encontro é casa de Deus Pai

Há esperança na casa
Recomeço na casa
Reunidos Nele
Nosso encontro é casa

De Deus Pai
De Deus Pai
De Deus Pai

Do meu Pai
Do teu Pai
Do nosso Pai

Há lugar na casa
Há perdão na casa
Quando estamos juntos
Nosso encontro é casa de Deus Pai

Há esperança na casa
Recomeço na casa
Reunidos Nele
Nosso encontro é casa de Deus Pai`

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
    lyrics: A_BOA_PARTE_LYRICS,
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
    lyrics: ALGO_NOVO_LYRICS,
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
    lyrics: EU_SOU_TEU_LYRICS,
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
    lyrics: ME_AMA_LYRICS,
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
    lyrics: NA_CASA_LYRICS,
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

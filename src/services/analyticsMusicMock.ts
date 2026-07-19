import { IS_DEMO_MODE } from '@/demo/demoConfig'
import type {
  AnalyticsAbsencePeriod,
  AnalyticsTimeRange,
  EventAnalyticsPeriod,
  EventAnalyticsSeries,
  HeatmapMonth,
  MusicAnalytics,
  MusicForgottenSong,
  MusicHeatmapCell,
  MusicHeatmapSong,
  MusicInterval,
  MusicSongRanking
} from '@/types/analytics'

/** Equivale a IS_DEMO_MODE — não manter true fixo bloqueando a API. */
export const USE_MUSIC_ANALYTICS_MOCK = IS_DEMO_MODE

type MockMusicQuery = {
  range: AnalyticsTimeRange
  forgottenPeriod: AnalyticsAbsencePeriod
  rankingLimit?: number
}

const SONGS: Array<{
  id: number
  name: string
  author: string | null
  theme: string | null
  difficulty: string | null
  popularity: string | null
}> = [
  { id: 1, name: 'Castelo Forte', author: 'Martinho Lutero', theme: 'Louvor', difficulty: 'Fácil', popularity: 'Alta' },
  { id: 2, name: 'Quão Grande É o Meu Deus', author: 'Chris Tomlin', theme: 'Adoração', difficulty: 'Média', popularity: 'Alta' },
  { id: 3, name: 'Ao Único', author: 'Asaph Borba', theme: 'Louvor', difficulty: 'Fácil', popularity: 'Média' },
  { id: 4, name: 'Santo Espírito', author: 'Fernanda Brum', theme: 'Adoração', difficulty: 'Difícil', popularity: 'Alta' },
  { id: 5, name: 'Grande É o Senhor', author: 'Tradicional', theme: 'Louvor', difficulty: 'Fácil', popularity: 'Média' },
  { id: 6, name: 'Em Espírito, Em Verdade', author: 'Tradicional', theme: 'Adoração', difficulty: 'Média', popularity: 'Alta' },
  { id: 7, name: 'Aos Pés da Cruz', author: 'Ministerio Zoe', theme: 'Ceia', difficulty: 'Média', popularity: 'Baixa' },
  { id: 8, name: 'Digno de Louvor', author: 'Adhemar de Campos', theme: 'Louvor', difficulty: 'Fácil', popularity: 'Média' },
  { id: 9, name: 'Fonte de Água Viva', author: 'Tradicional', theme: 'Missões', difficulty: 'Média', popularity: 'Baixa' },
  { id: 10, name: 'Jesus É o Centro', author: 'Israel Houghton', theme: 'Adoração', difficulty: 'Difícil', popularity: 'Alta' },
  { id: 11, name: 'Hino da Esperança', author: 'Comunidade local', theme: 'Esperança', difficulty: 'Fácil', popularity: 'Baixa' },
  { id: 12, name: 'Salmo 23', author: 'Tradicional', theme: 'Salmos', difficulty: 'Média', popularity: 'Média' },
  { id: 13, name: 'Canção do Peregrino', author: 'Anônimo', theme: null, difficulty: null, popularity: 'Baixa' },
  { id: 14, name: 'Nova Manhã', author: 'Equipe Batel', theme: 'Esperança', difficulty: 'Fácil', popularity: null },
  { id: 15, name: 'Não Há Deus Maior', author: 'Tradicional', theme: 'Louvor', difficulty: 'Fácil', popularity: 'Alta' },
  { id: 16, name: 'Consagração', author: 'Harpa Cristã', theme: 'Ceia', difficulty: 'Média', popularity: 'Média' },
  { id: 17, name: 'Maravilhosa Graça', author: 'John Newton', theme: 'Graça', difficulty: 'Fácil', popularity: 'Alta' },
  { id: 18, name: 'Teu Santo Nome', author: 'Nívea Soares', theme: 'Adoração', difficulty: 'Difícil', popularity: 'Média' },
  { id: 19, name: 'Cântico Antigo', author: null, theme: null, difficulty: 'Difícil', popularity: 'Baixa' },
  { id: 20, name: 'Somos Um', author: 'Ministério Unção', theme: 'Unidade', difficulty: 'Média', popularity: 'Média' }
]

function createRng(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function hashRangeSeed(range: string): number {
  return range.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function resolveRangeStart(range: AnalyticsTimeRange, today: Date): Date | null {
  if (range === 'all') {
    return null
  }

  const months = range === '3m' ? 3 : range === '6m' ? 6 : range === '1y' ? 12 : 60
  return addMonths(today, -months)
}

function resolveForgottenStart(period: AnalyticsAbsencePeriod, today: Date): Date {
  const months = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12
  return addMonths(today, -months)
}

function buildPeriods(rangeStart: Date | null, today: Date): EventAnalyticsPeriod[] {
  const start = startOfMonth(rangeStart ?? addMonths(today, -18))
  const end = startOfMonth(today)
  const periods: EventAnalyticsPeriod[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    periods.push({
      periodKey: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
      label: cursor
        .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        .replace('.', '')
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return periods
}

function monthLabelShort(date: Date): string {
  const abbreviated = date
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '')
  return `${abbreviated}/${String(date.getFullYear()).slice(-2)}`
}

function buildSeries(
  buckets: Map<string, { label: string; counts: number[] }>,
  fallbackLabel: string
): EventAnalyticsSeries[] {
  return Array.from(buckets.entries())
    .map(([seriesKey, entry]) => ({
      seriesKey,
      label: entry.label,
      values: entry.counts
    }))
    .sort((a, b) => {
      if (a.label === fallbackLabel) {
        return 1
      }

      if (b.label === fallbackLabel) {
        return -1
      }

      return a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' })
    })
}

export function buildMockMusicAnalytics(
  query: MockMusicQuery
): MusicAnalytics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const rangeStart = resolveRangeStart(query.range, today)
  const forgottenStart = resolveForgottenStart(query.forgottenPeriod, today)
  const periods = buildPeriods(rangeStart, today)
  const limit = Math.min(Math.max(query.rankingLimit ?? 50, 1), 100)
  const rng = createRng(4043 + hashRangeSeed(query.range) * 13 + hashRangeSeed(query.forgottenPeriod) * 7)

  type Play = { songId: number; date: Date }
  const plays: Play[] = []

  periods.forEach((period, periodIndex) => {
    const [year, month] = period.periodKey.split('-').map(Number)
    const playsInMonth = 8 + Math.floor(rng() * 10)

    for (let index = 0; index < playsInMonth; index += 1) {
      const song = SONGS[Math.floor(rng() * SONGS.length)]
      if (!song) {
        continue
      }

      // Algumas músicas ficam esquecidas / pouco usadas
      if (song.id >= 18 && rng() > 0.25) {
        continue
      }

      const day = 1 + Math.floor(rng() * 27)
      plays.push({
        songId: song.id,
        date: new Date(year, (month ?? 1) - 1, day)
      })
    }

    // Bias: primeiros períodos com músicas "esquecidas"
    if (periodIndex < 2) {
      plays.push({
        songId: 19,
        date: new Date(year, (month ?? 1) - 1, 5)
      })
    }
  })

  const songById = new Map(SONGS.map((song) => [song.id, song]))

  const playCounts = new Map<number, number>()
  plays.forEach((play) => {
    playCounts.set(play.songId, (playCounts.get(play.songId) ?? 0) + 1)
  })

  const rankings: MusicSongRanking[] = SONGS.map((song) => ({
    repertoireId: song.id,
    songName: song.name,
    author: song.author,
    playCount: playCounts.get(song.id) ?? 0
  }))

  const mostPlayed = [...rankings]
    .sort((a, b) => b.playCount - a.playCount || a.songName.localeCompare(b.songName, 'pt-BR'))
    .slice(0, limit)

  const leastPlayed = [...rankings]
    .sort((a, b) => a.playCount - b.playCount || a.songName.localeCompare(b.songName, 'pt-BR'))
    .slice(0, limit)

  const lastPlayBySong = new Map<number, Date>()
  plays.forEach((play) => {
    const current = lastPlayBySong.get(play.songId)
    if (!current || play.date > current) {
      lastPlayBySong.set(play.songId, play.date)
    }
  })

  // Algumas músicas sem play recente
  const forgottenSongs = SONGS
    .map((song): MusicForgottenSong | null => {
      const last = lastPlayBySong.get(song.id) ?? null
      if (last && last >= forgottenStart) {
        return null
      }

      const days = last
        ? Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
        : Math.round((today.getTime() - forgottenStart.getTime()) / (1000 * 60 * 60 * 24))

      return {
        repertoireId: song.id,
        songName: song.name,
        author: song.author,
        lastPlayedDate: last ? formatDateOnly(last) : null,
        daysSinceLastPlayed: days
      }
    })
    .filter((item): item is MusicForgottenSong => item !== null)
    .sort((a, b) => b.daysSinceLastPlayed - a.daysSinceLastPlayed || a.songName.localeCompare(b.songName, 'pt-BR'))
    .slice(0, limit)

  const ensureBucket = (
    map: Map<string, { label: string; counts: number[] }>,
    key: string,
    label: string
  ) => {
    let entry = map.get(key)
    if (!entry) {
      entry = { label, counts: periods.map(() => 0) }
      map.set(key, entry)
    }
    return entry
  }

  const themeBuckets = new Map<string, { label: string; counts: number[] }>()
  const difficultyBuckets = new Map<string, { label: string; counts: number[] }>()
  const popularityBuckets = new Map<string, { label: string; counts: number[] }>()

  plays.forEach((play) => {
    const song = songById.get(play.songId)
    if (!song) {
      return
    }

    const periodKey = `${play.date.getFullYear()}-${String(play.date.getMonth() + 1).padStart(2, '0')}`
    const periodIndex = periods.findIndex((period) => period.periodKey === periodKey)
    if (periodIndex < 0) {
      return
    }

    const themeLabel = song.theme ?? 'Sem tema'
    const difficultyLabel = song.difficulty ?? 'Sem dificuldade'
    const popularityLabel = song.popularity ?? 'Sem popularidade'

    ensureBucket(themeBuckets, themeLabel.toLowerCase(), themeLabel).counts[periodIndex] += 1
    ensureBucket(difficultyBuckets, difficultyLabel.toLowerCase(), difficultyLabel).counts[periodIndex] += 1
    ensureBucket(popularityBuckets, popularityLabel.toLowerCase(), popularityLabel).counts[periodIndex] += 1
  })

  const averageIntervals = SONGS
    .map((song): MusicInterval | null => {
      const dates = plays
        .filter((play) => play.songId === song.id)
        .map((play) => play.date.getTime())
        .sort((a, b) => a - b)

      const unique = [...new Set(dates)]
      if (unique.length < 2) {
        return null
      }

      const gaps: number[] = []
      for (let index = 1; index < unique.length; index += 1) {
        gaps.push((unique[index]! - unique[index - 1]!) / (1000 * 60 * 60 * 24))
      }

      const average = gaps.reduce((sum, value) => sum + value, 0) / gaps.length

      return {
        repertoireId: song.id,
        songName: song.name,
        author: song.author,
        playCount: unique.length,
        averageDaysBetweenPlays: Math.round(average * 10) / 10
      }
    })
    .filter((item): item is MusicInterval => item !== null)
    .sort((a, b) => b.averageDaysBetweenPlays - a.averageDaysBetweenPlays || a.songName.localeCompare(b.songName, 'pt-BR'))
    .slice(0, limit)

  const heatmapSongIds = mostPlayed.slice(0, 12).map((item) => item.repertoireId)
  const heatmapSongs: MusicHeatmapSong[] = heatmapSongIds.map((id) => {
    const song = songById.get(id)!
    return { repertoireId: song.id, songName: song.name }
  })

  const heatmapMonths: HeatmapMonth[] = periods.map((period) => {
    const [year, month] = period.periodKey.split('-').map(Number)
    const monthStart = new Date(year, (month ?? 1) - 1, 1)
    return {
      monthKey: period.periodKey,
      label: monthLabelShort(monthStart),
      monthStart: formatDateOnly(monthStart)
    }
  })

  const heatmapCells: MusicHeatmapCell[] = []
  heatmapSongs.forEach((song) => {
    heatmapMonths.forEach((month) => {
      const count = plays.filter((play) => {
        const key = `${play.date.getFullYear()}-${String(play.date.getMonth() + 1).padStart(2, '0')}`
        return play.songId === song.repertoireId && key === month.monthKey
      }).length

      if (count > 0) {
        heatmapCells.push({
          repertoireId: song.repertoireId,
          monthKey: month.monthKey,
          playCount: count
        })
      }
    })
  })

  return {
    range: query.range,
    rangeStart: rangeStart ? formatDateOnly(rangeStart) : null,
    rangeEnd: formatDateOnly(today),
    forgottenPeriod: query.forgottenPeriod,
    mostPlayed,
    leastPlayed,
    forgottenSongs,
    periods,
    byTheme: buildSeries(themeBuckets, 'Sem tema'),
    byDifficulty: buildSeries(difficultyBuckets, 'Sem dificuldade'),
    byPopularity: buildSeries(popularityBuckets, 'Sem popularidade'),
    averageIntervals,
    heatmapSongs,
    heatmapMonths,
    heatmapCells
  }
}

export function getMockMusicAnalytics(query: MockMusicQuery) {
  return Promise.resolve({
    payload: buildMockMusicAnalytics(query),
    message: 'Dados de teste de músicas'
  })
}

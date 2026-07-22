import type { RepertoireListItem } from '@/types/repertoire'

export function formatAuthorVersion(item: RepertoireListItem): string {
  const parts = [item.author, item.version].filter(Boolean)

  if (parts.length === 0) {
    return 'Autor e versão não informados'
  }

  return parts.join(' · ')
}

export function hasVoiceKits(item: RepertoireListItem): boolean {
  return Boolean(
    item.sopranoKitVoiceUrl
    || item.contraltoKitVoiceUrl
    || item.contraltoKitUnavailable
    || item.tenorKitVoiceUrl
  )
}

export function hasBadges(item: RepertoireListItem): boolean {
  return Boolean(
    item.key
    || item.difficultyLevelName
    || item.popularityLevelName
    || item.musicalThemes.length > 0
  )
}

export function hasResourceActions(item: RepertoireListItem): boolean {
  return Boolean(
    item.referenceUrl1
    || item.referenceUrl2
    || item.lyrics
    || item.playbackUrl
    || hasVoiceKits(item)
    || item.chordUrl
    || item.sheetMusicUrl
  )
}

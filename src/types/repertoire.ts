import type { ApiResponse } from '@/types/api'

export type CatalogItemBase = {
  id: number
  displayOrder: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type DifficultyLevel = {
  id: number
  name: string
  displayOrder: number
  linkedRepertoireCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type PopularityLevel = {
  id: number
  name: string
  displayOrder: number
  linkedRepertoireCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type MusicalTheme = {
  id: number
  name: string
  description: string | null
  linkedRepertoireCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type CreateDifficultyLevelRequest = {
  name: string
}

export type UpdateDifficultyLevelRequest = {
  name: string
}

export type ReorderDifficultyLevelsRequest = {
  orderedIds: number[]
}

export type CreatePopularityLevelRequest = {
  name: string
}

export type UpdatePopularityLevelRequest = {
  name: string
}

export type ReorderPopularityLevelsRequest = {
  orderedIds: number[]
}

export type CreateMusicalThemeRequest = {
  name: string
  description?: string | null
}

export type UpdateMusicalThemeRequest = {
  name: string
  description?: string | null
}

export type DifficultyLevelResponse = ApiResponse<DifficultyLevel>
export type DifficultyLevelListResponse = ApiResponse<DifficultyLevel[]>
export type PopularityLevelResponse = ApiResponse<PopularityLevel>
export type PopularityLevelListResponse = ApiResponse<PopularityLevel[]>
export type MusicalThemeResponse = ApiResponse<MusicalTheme>
export type MusicalThemeListResponse = ApiResponse<MusicalTheme[]>

export type MusicalThemeSummary = {
  id: number
  name: string
}

export type RepertoireListQuery = {
  search?: string
  difficultyLevelId?: number | null
  popularityLevelId?: number | null
  musicalThemeId?: number | null
  favoritesOnly?: boolean
  page?: number
  pageSize?: number
}

export type RepertoireListItem = {
  id: number
  songName: string
  author: string | null
  version: string | null
  key: string | null
  difficultyLevelName: string | null
  popularityLevelName: string | null
  referenceUrl1: string | null
  referenceUrl2: string | null
  playbackUrl: string | null
  lyrics: string | null
  chordUrl: string | null
  sheetMusicUrl: string | null
  sopranoKitVoiceUrl: string | null
  contraltoKitVoiceUrl: string | null
  tenorKitVoiceUrl: string | null
  notes: string | null
  musicalThemes: MusicalThemeSummary[]
  isFavorite: boolean
}

export type RepertoireDetails = {
  id: number
  songName: string
  author: string | null
  version: string | null
  difficultyLevelId: number | null
  difficultyLevelName: string | null
  popularityLevelId: number | null
  popularityLevelName: string | null
  referenceUrl1: string | null
  referenceUrl2: string | null
  playbackUrl: string | null
  lyrics: string | null
  chordUrl: string | null
  sheetMusicUrl: string | null
  key: string | null
  hymnNumber: string | null
  sopranoKitVoiceUrl: string | null
  contraltoKitVoiceUrl: string | null
  tenorKitVoiceUrl: string | null
  notes: string | null
  isFavorite: boolean
  musicalThemeIds: number[]
  musicalThemes: MusicalThemeSummary[]
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
}

export type SaveRepertoireRequest = {
  songName: string
  author?: string | null
  version?: string | null
  difficultyLevelId?: number | null
  popularityLevelId?: number | null
  referenceUrl1?: string | null
  referenceUrl2?: string | null
  playbackUrl?: string | null
  lyrics?: string | null
  chordUrl?: string | null
  sheetMusicUrl?: string | null
  key?: string | null
  hymnNumber?: string | null
  sopranoKitVoiceUrl?: string | null
  contraltoKitVoiceUrl?: string | null
  tenorKitVoiceUrl?: string | null
  notes?: string | null
  musicalThemeIds: number[]
}

export type RepertoireListResponse = ApiResponse<RepertoireListItem[]>
export type RepertoireDetailsResponse = ApiResponse<RepertoireDetails>

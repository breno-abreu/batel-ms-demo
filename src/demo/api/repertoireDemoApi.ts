import {
  demoPublicFolderRepertoires,
  demoRepertoireGroupItems,
  demoRepertoireGroups,
  demoRepertoireList,
  demoRepertoires,
  toRepertoireListItem
} from '@/demo/data/repertoire'
import { DEMO_PUBLIC_SHARE_HASH } from '@/demo/publicShare'
import { demoMutationOk, demoNotFound, demoOk, matchesSearch, paginateItems } from '@/demo/demoHelpers'
import type { RepertoireListQuery } from '@/types/repertoire'
import type { UpdateRepertoireGroupRequest } from '@/types/repertoireGroup'

export const demoRepertoireApi = {
  list: async (query: RepertoireListQuery = {}) => {
    let items = [...demoRepertoireList]

    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase()
      items = items.filter((item) =>
        matchesSearch(item.songName, term)
        || matchesSearch(item.author, term)
        || matchesSearch(item.key, term)
      )
    }

    if (query.difficultyLevelId) {
      const allowed = new Set(
        demoRepertoires
          .filter((item) => item.difficultyLevelId === query.difficultyLevelId)
          .map((item) => item.id)
      )
      items = items.filter((item) => allowed.has(item.id))
    }

    if (query.popularityLevelId) {
      const allowed = new Set(
        demoRepertoires
          .filter((item) => item.popularityLevelId === query.popularityLevelId)
          .map((item) => item.id)
      )
      items = items.filter((item) => allowed.has(item.id))
    }

    if (query.musicalThemeId) {
      const allowed = new Set(
        demoRepertoires
          .filter((item) => item.musicalThemeIds.includes(query.musicalThemeId!))
          .map((item) => item.id)
      )
      items = items.filter((item) => allowed.has(item.id))
    }

    if (query.favoritesOnly) {
      items = items.filter((item) => item.isFavorite)
    }

    return demoOk(paginateItems(items, query.page ?? 1, query.pageSize ?? 20))
  },

  getById: async (id: number) => {
    const item = demoRepertoires.find((entry) => entry.id === id)
    return item ? demoOk(item) : demoNotFound()
  },

  create: async () => demoMutationOk(demoRepertoires[0]),
  update: async (id: number) => {
    const item = demoRepertoires.find((entry) => entry.id === id) ?? demoRepertoires[0]
    return demoMutationOk(item)
  },
  setFavorite: async () => demoMutationOk(null),
  remove: async () => demoMutationOk(null)
}

export const demoRepertoireGroupApi = {
  list: async () => demoOk([...demoRepertoireGroups]),
  getById: async (id: number) => {
    const group = demoRepertoireGroups.find((item) => item.id === id)
    return group ? demoOk(group) : demoNotFound()
  },
  create: async () => demoMutationOk(demoRepertoireGroups[0]),
  update: async (id: number, payload: UpdateRepertoireGroupRequest) => {
    const group = demoRepertoireGroups.find((item) => item.id === id) ?? demoRepertoireGroups[0]
    const allowPublicLinkAccess = payload.isPublic && payload.allowPublicLinkAccess

    return demoMutationOk({
      ...group,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      isPublic: payload.isPublic,
      allowPublicLinkAccess,
      hasPublicShareLink: allowPublicLinkAccess && Boolean(group.publicShareHash),
      publicShareHash: allowPublicLinkAccess ? group.publicShareHash : null
    })
  },
  remove: async () => demoMutationOk(null),
  generateShareLink: async (_id: number) => {
    return demoMutationOk({
      shareHash: DEMO_PUBLIC_SHARE_HASH.repertoireGroup
    })
  },
  listRepertoires: async (id: number) => {
    const ids = demoRepertoireGroupItems[id] ?? []
    const items = ids
      .map((repertoireId) => demoRepertoires.find((item) => item.id === repertoireId))
      .filter(Boolean)
      .map((item) => toRepertoireListItem(item!))
    return demoOk(items)
  },
  addRepertoire: async () => demoMutationOk(null),
  removeRepertoire: async () => demoMutationOk(null),
  getPublicByShareHash: async (_shareHash: string) => {
    const group = demoRepertoireGroups[0]

    return demoOk({
      id: group.id,
      name: 'BLESS Agosto de 2026',
      description: 'Pasta demonstrativa: BLESS Agosto de 2026',
      itemCount: demoPublicFolderRepertoires.length
    })
  },
  listPublicRepertoires: async (_shareHash: string) => {
    return demoOk(demoPublicFolderRepertoires)
  }
}

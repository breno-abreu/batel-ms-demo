import {
  demoSongSuggestionsAdmin,
  demoSongSuggestionsMine
} from '@/demo/data/songSuggestions'
import { demoMutationOk, demoOk, matchesSearch, paginateItems } from '@/demo/demoHelpers'
import type { SongSuggestionAdminListQuery } from '@/types/songSuggestion'

export const demoSongSuggestionApi = {
  listMine: async () => demoOk([...demoSongSuggestionsMine]),
  create: async () => demoMutationOk(demoSongSuggestionsMine[0]),
  update: async (id: number) => {
    const item = demoSongSuggestionsMine.find((entry) => entry.id === id) ?? demoSongSuggestionsMine[0]
    return demoMutationOk(item)
  },
  remove: async () => demoMutationOk(null),
  listForAdmin: async (query: SongSuggestionAdminListQuery = {}) => {
    let items = [...demoSongSuggestionsAdmin]

    if (query.search?.trim()) {
      items = items.filter((item) =>
        matchesSearch(item.name, query.search)
        || matchesSearch(item.userFullName, query.search)
        || matchesSearch(item.userEmail, query.search)
      )
    }

    if (query.status === 'reviewed') {
      items = items.filter((item) => item.isReviewed)
    } else if (query.status === 'pending') {
      items = items.filter((item) => !item.isReviewed)
    }

    return demoOk(paginateItems(items, query.page ?? 1, query.pageSize ?? 20))
  },
  review: async (id: number) => {
    const item = demoSongSuggestionsAdmin.find((entry) => entry.id === id) ?? demoSongSuggestionsAdmin[0]
    return demoMutationOk(item)
  }
}

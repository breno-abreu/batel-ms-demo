import { demoSongSuggestionApi } from '@/demo/api/miscDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateSongSuggestionRequest, ReviewSongSuggestionRequest, SongSuggestionAdminListQuery, UpdateSongSuggestionRequest } from '@/types/songSuggestion'

export const songSuggestionService = {
  listMine() {
    return demoSongSuggestionApi.listMine()
  },

  create(_payload: CreateSongSuggestionRequest) {
    return withDemoMutation(() => demoSongSuggestionApi.create())
  },

  update(id: number, _payload: UpdateSongSuggestionRequest) {
    return withDemoMutation(() => demoSongSuggestionApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoSongSuggestionApi.remove())
  },

  listForAdmin(query: SongSuggestionAdminListQuery = {}) {
    return demoSongSuggestionApi.listForAdmin(query)
  },

  review(id: number, _payload: ReviewSongSuggestionRequest) {
    return withDemoMutation(() => demoSongSuggestionApi.review(id))
  }
}

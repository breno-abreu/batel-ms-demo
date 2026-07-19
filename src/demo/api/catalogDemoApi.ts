import {
  demoDifficultyLevels,
  demoEventTypes,
  demoMusicalThemes,
  demoPopularityLevels,
  demoPriorities,
  demoPurchaseRequestStatuses,
  demoTicketStatuses,
  demoTicketTypes,
  demoUsefulLinkTypes,
  demoWorkTaskStatuses
} from '@/demo/data/catalogs'
import { demoMutationOk, demoOk } from '@/demo/demoHelpers'

function createReadonlyCatalogApi<T extends { id: number }>(items: T[]) {
  const first = items[0]

  return {
    list: async () => demoOk([...items]),
    getExisting: (id: number) => items.find((item) => item.id === id) ?? first,
    create: async () => demoMutationOk(first),
    update: async (id: number) => demoMutationOk(items.find((item) => item.id === id) ?? first),
    toggleActive: async (id: number) => demoMutationOk(items.find((item) => item.id === id) ?? first),
    remove: async () => demoMutationOk(null),
    reorder: async () => demoMutationOk([...items])
  }
}

export const demoDifficultyLevelApi = createReadonlyCatalogApi(demoDifficultyLevels)
export const demoPopularityLevelApi = createReadonlyCatalogApi(demoPopularityLevels)
export const demoMusicalThemeApi = createReadonlyCatalogApi(demoMusicalThemes)
export const demoEventTypeApi = createReadonlyCatalogApi(demoEventTypes)
export const demoUsefulLinkTypeApi = createReadonlyCatalogApi(demoUsefulLinkTypes)
export const demoTicketTypeApi = createReadonlyCatalogApi(demoTicketTypes)
export const demoTicketStatusApi = createReadonlyCatalogApi(demoTicketStatuses)
export const demoPriorityApi = createReadonlyCatalogApi(demoPriorities)
export const demoWorkTaskStatusApi = createReadonlyCatalogApi(demoWorkTaskStatuses)
export const demoPurchaseRequestStatusApi = createReadonlyCatalogApi(demoPurchaseRequestStatuses)

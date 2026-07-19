import {
  demoUsefulLinkGroupItems,
  demoUsefulLinkGroups,
  demoUsefulLinks
} from '@/demo/data/usefulLinks'
import { demoMutationOk, demoNotFound, demoOk, matchesSearch, paginateItems } from '@/demo/demoHelpers'
import type { UsefulLinkListQuery } from '@/types/usefulLinks'
import type {
  UpdateUsefulLinkGroupRequest,
  UsefulLinkGroupListQuery
} from '@/types/usefulLinkGroup'

export const demoUsefulLinkApi = {
  list: async (query: UsefulLinkListQuery = {}) => {
    let items = [...demoUsefulLinks]

    if (query.search?.trim()) {
      items = items.filter((item) =>
        matchesSearch(item.name, query.search)
        || matchesSearch(item.url, query.search)
        || matchesSearch(item.notes, query.search)
      )
    }

    if (query.usefulLinkTypeId) {
      items = items.filter((item) => item.usefulLinkTypeId === query.usefulLinkTypeId)
    }

    return demoOk(paginateItems(items, query.page ?? 1, query.pageSize ?? 20))
  },
  getById: async (id: number) => {
    const item = demoUsefulLinks.find((entry) => entry.id === id)
    return item ? demoOk(item) : demoNotFound()
  },
  create: async () => demoMutationOk(demoUsefulLinks[0]),
  update: async (id: number) => {
    const item = demoUsefulLinks.find((entry) => entry.id === id) ?? demoUsefulLinks[0]
    return demoMutationOk(item)
  },
  remove: async () => demoMutationOk(null)
}

export const demoUsefulLinkGroupApi = {
  list: async (query: UsefulLinkGroupListQuery = {}) => {
    let items = [...demoUsefulLinkGroups]

    if (query.search?.trim()) {
      items = items.filter((item) =>
        matchesSearch(item.name, query.search)
        || matchesSearch(item.description, query.search)
      )
    }

    if (query.visibility === 'private') {
      items = items.filter((item) => !item.isPublic)
    } else if (query.visibility === 'public') {
      items = items.filter((item) => item.isPublic && !item.allowPublicLinkAccess)
    } else if (query.visibility === 'external') {
      items = items.filter((item) => item.isPublic && item.allowPublicLinkAccess)
    }

    return demoOk(paginateItems(items, query.page ?? 1, query.pageSize ?? 20))
  },
  getById: async (id: number) => {
    const group = demoUsefulLinkGroups.find((item) => item.id === id)
    return group ? demoOk(group) : demoNotFound()
  },
  create: async () => demoMutationOk(demoUsefulLinkGroups[0]),
  update: async (id: number, payload: UpdateUsefulLinkGroupRequest) => {
    const group = demoUsefulLinkGroups.find((item) => item.id === id) ?? demoUsefulLinkGroups[0]
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
  generateShareLink: async (id: number) => {
    const group = demoUsefulLinkGroups.find((item) => item.id === id)
    return demoMutationOk({
      shareHash: group?.publicShareHash ?? `ulink-group-${id}-demo`
    })
  },
  listUsefulLinks: async (id: number) => {
    const ids = demoUsefulLinkGroupItems[id] ?? []
    const items = ids
      .map((linkId) => demoUsefulLinks.find((item) => item.id === linkId))
      .filter(Boolean)
    return demoOk(items as typeof demoUsefulLinks)
  },
  addUsefulLink: async () => demoMutationOk(null),
  removeUsefulLink: async () => demoMutationOk(null),
  getPublicByShareHash: async (shareHash: string) => {
    const group = demoUsefulLinkGroups.find((item) => item.publicShareHash === shareHash)

    if (!group) {
      return demoNotFound()
    }

    return demoOk({
      id: group.id,
      name: group.name,
      description: group.description,
      itemCount: group.itemCount
    })
  },
  listPublicUsefulLinks: async (shareHash: string) => {
    const group = demoUsefulLinkGroups.find((item) => item.publicShareHash === shareHash)

    if (!group) {
      return demoNotFound()
    }

    const ids = demoUsefulLinkGroupItems[group.id] ?? []
    const items = ids
      .map((linkId) => demoUsefulLinks.find((item) => item.id === linkId))
      .filter(Boolean)

    return demoOk(items as typeof demoUsefulLinks)
  }
}

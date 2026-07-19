import { demoPurchaseRequests, demoWorkTasks } from '@/demo/data/requests'
import { demoMutationOk, demoOk, matchesSearch, paginateItems } from '@/demo/demoHelpers'
import type { PurchaseRequestListQuery, WorkTaskListQuery } from '@/types/requests'

export const demoPurchaseRequestApi = {
  list: async (query: PurchaseRequestListQuery = {}) => {
    let items = [...demoPurchaseRequests]

    if (query.search?.trim()) {
      items = items.filter((item) =>
        matchesSearch(item.title, query.search)
        || matchesSearch(item.description, query.search)
      )
    }

    if (query.ministryId) {
      items = items.filter((item) => item.ministryId === query.ministryId)
    }

    if (query.purchaseRequestStatusId) {
      items = items.filter((item) => item.purchaseRequestStatusId === query.purchaseRequestStatusId)
    }

    if (query.priorityId) {
      items = items.filter((item) => item.priorityId === query.priorityId)
    }

    return demoOk(paginateItems(items, query.page ?? 1, query.pageSize ?? 20))
  },
  create: async () => demoMutationOk(demoPurchaseRequests[0]),
  update: async (id: number) => {
    const item = demoPurchaseRequests.find((entry) => entry.id === id) ?? demoPurchaseRequests[0]
    return demoMutationOk(item)
  },
  remove: async () => demoMutationOk(null)
}

export const demoWorkTaskApi = {
  list: async (query: WorkTaskListQuery = {}) => {
    let items = [...demoWorkTasks]

    if (query.search?.trim()) {
      items = items.filter((item) =>
        matchesSearch(item.title, query.search)
        || matchesSearch(item.description, query.search)
      )
    }

    if (query.ministryId) {
      items = items.filter((item) => item.ministryId === query.ministryId)
    }

    if (query.taskStatusId) {
      items = items.filter((item) => item.taskStatusId === query.taskStatusId)
    }

    if (query.taskPriorityId) {
      items = items.filter((item) => item.taskPriorityId === query.taskPriorityId)
    }

    return demoOk(paginateItems(items, query.page ?? 1, query.pageSize ?? 20))
  },
  create: async () => demoMutationOk(demoWorkTasks[0]),
  update: async (id: number) => {
    const item = demoWorkTasks.find((entry) => entry.id === id) ?? demoWorkTasks[0]
    return demoMutationOk(item)
  },
  remove: async () => demoMutationOk(null)
}

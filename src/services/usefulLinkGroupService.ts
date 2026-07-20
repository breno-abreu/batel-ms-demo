import { demoUsefulLinkGroupApi } from '@/demo/api/usefulLinkDemoApi'
import { DEMO_PUBLIC_SHARE_HASH } from '@/demo/publicShare'
import { withDemoMutation } from '@/demo/demoRequest'
import type { UsefulLink } from '@/types/usefulLinks'
import type { CreateUsefulLinkGroupRequest, UpdateUsefulLinkGroupRequest, UsefulLinkGroupListQuery } from '@/types/usefulLinkGroup'

const PUBLIC_SHARE_ROUTE = '/public/links-uteis'

export function buildPublicShareUrl(_shareHash?: string): string {
  const shareHash = DEMO_PUBLIC_SHARE_HASH.usefulLinkGroup

  if (typeof window === 'undefined') {
    return `${PUBLIC_SHARE_ROUTE}/${shareHash}`
  }

  return `${window.location.origin}${PUBLIC_SHARE_ROUTE}/${shareHash}`
}

export const usefulLinkGroupService = {
  list(query: UsefulLinkGroupListQuery = {}) {
    return demoUsefulLinkGroupApi.list(query)
  },

  getById(id: number) {
    return demoUsefulLinkGroupApi.getById(id)
  },

  create(_payload: CreateUsefulLinkGroupRequest) {
    return withDemoMutation(() => demoUsefulLinkGroupApi.create())
  },

  update(id: number, payload: UpdateUsefulLinkGroupRequest) {
    return withDemoMutation(() => demoUsefulLinkGroupApi.update(id, payload))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoUsefulLinkGroupApi.remove())
  },

  generateShareLink(id: number) {
    return withDemoMutation(() => demoUsefulLinkGroupApi.generateShareLink(id))
  },

  listUsefulLinks(id: number) {
    return demoUsefulLinkGroupApi.listUsefulLinks(id)
  },

  addUsefulLink(_groupId: number, _usefulLinkId: number) {
    return withDemoMutation(() => demoUsefulLinkGroupApi.addUsefulLink())
  },

  removeUsefulLink(_groupId: number, _usefulLinkId: number) {
    return withDemoMutation(() => demoUsefulLinkGroupApi.removeUsefulLink())
  },

  getPublicByShareHash(shareHash: string) {
    return demoUsefulLinkGroupApi.getPublicByShareHash(shareHash)
  },

  listPublicUsefulLinks(shareHash: string) {
    return demoUsefulLinkGroupApi.listPublicUsefulLinks(shareHash)
  }
}

export type { UsefulLink }

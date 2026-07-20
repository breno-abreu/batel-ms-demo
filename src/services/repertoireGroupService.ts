import { demoRepertoireGroupApi } from '@/demo/api/repertoireDemoApi'
import { DEMO_PUBLIC_SHARE_HASH } from '@/demo/publicShare'
import { withDemoMutation } from '@/demo/demoRequest'
import type { RepertoireListItem } from '@/types/repertoire'
import type { CreateRepertoireGroupRequest, UpdateRepertoireGroupRequest } from '@/types/repertoireGroup'

const PUBLIC_SHARE_ROUTE = '/public/repertorio-pasta'

export function buildPublicShareUrl(_shareHash?: string): string {
  const shareHash = DEMO_PUBLIC_SHARE_HASH.repertoireGroup

  if (typeof window === 'undefined') {
    return `${PUBLIC_SHARE_ROUTE}/${shareHash}`
  }

  return `${window.location.origin}${PUBLIC_SHARE_ROUTE}/${shareHash}`
}

export const repertoireGroupService = {
  list() {
    return demoRepertoireGroupApi.list()
  },
  getById(id: number) {
    return demoRepertoireGroupApi.getById(id)
  },

  create(_payload: CreateRepertoireGroupRequest) {
    return withDemoMutation(() => demoRepertoireGroupApi.create())
  },

  update(id: number, payload: UpdateRepertoireGroupRequest) {
    return withDemoMutation(() => demoRepertoireGroupApi.update(id, payload))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoRepertoireGroupApi.remove())
  },

  generateShareLink(id: number) {
    return demoRepertoireGroupApi.generateShareLink(id)
  },

  listRepertoires(id: number) {
    return demoRepertoireGroupApi.listRepertoires(id)
  },

  addRepertoire(_groupId: number, _repertoireId: number) {
    return withDemoMutation(() => demoRepertoireGroupApi.addRepertoire())
  },

  removeRepertoire(_groupId: number, _repertoireId: number) {
    return withDemoMutation(() => demoRepertoireGroupApi.removeRepertoire())
  },

  getPublicByShareHash(shareHash: string) {
    return demoRepertoireGroupApi.getPublicByShareHash(shareHash)
  },

  listPublicRepertoires(shareHash: string) {
    return demoRepertoireGroupApi.listPublicRepertoires(shareHash)
  }
}

export type { RepertoireListItem }

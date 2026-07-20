import { demoEventScheduleApi } from '@/demo/api/eventDemoApi'
import { DEMO_PUBLIC_SHARE_HASH } from '@/demo/publicShare'
import { withDemoMutation } from '@/demo/demoRequest'
import { buildAppAbsoluteUrl } from '@/utils/urlUtils'
import type { CreateEventScheduleRequest, UpdateEventScheduleRequest } from '@/types/eventSchedule'

const PUBLIC_EVENT_SCHEDULE_SHARE_ROUTE = '/public/cronogramas'

export function buildPublicEventScheduleShareUrl(_shareHash?: string): string {
  const shareHash = DEMO_PUBLIC_SHARE_HASH.eventSchedule
  return buildAppAbsoluteUrl(`${PUBLIC_EVENT_SCHEDULE_SHARE_ROUTE}/${shareHash}`)
}

export const eventScheduleService = {
  listByEvent(eventId: number) {
    return demoEventScheduleApi.listByEvent(eventId)
  },

  create(eventId: number, _payload: CreateEventScheduleRequest) {
    return withDemoMutation(() => demoEventScheduleApi.create(eventId))
  },

  update(id: number, _payload: UpdateEventScheduleRequest) {
    return withDemoMutation(() => demoEventScheduleApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoEventScheduleApi.remove())
  },

  generateShareLink(eventId: number) {
    return demoEventScheduleApi.generateShareLink(eventId)
  },

  getPublicByShareHash(shareHash: string) {
    return demoEventScheduleApi.getPublicByShareHash(shareHash)
  }
}

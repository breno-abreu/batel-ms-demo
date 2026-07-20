import { demoTeamScheduleApi } from '@/demo/api/eventDemoApi'
import { DEMO_PUBLIC_SHARE_HASH } from '@/demo/publicShare'
import { withDemoMutation } from '@/demo/demoRequest'
import { buildAppAbsoluteUrl } from '@/utils/urlUtils'
import type { ApiResponse } from '@/types/api'
import type { RepertoireListItem } from '@/types/repertoire'
import type { SaveMonthlyTeamScheduleRequest } from '@/types/teamSchedules'

const PUBLIC_SCHEDULE_SHARE_ROUTE = '/public/repertorio-escala'
const PUBLIC_MONTHLY_SCHEDULE_SHARE_ROUTE = '/public/escalas-mensais'

export type TeamScheduleShareLink = {
  shareHash: string
}

export type PublicTeamSchedule = {
  eventName: string
  eventDate: string
  startTime: string | null
  endTime: string | null
  ministryName: string
  songCount: number
  usesFolder: boolean
  folderName: string | null
}

export type TeamScheduleShareLinkResponse = ApiResponse<TeamScheduleShareLink>
export type PublicTeamScheduleResponse = ApiResponse<PublicTeamSchedule>
export type PublicTeamScheduleRepertoireListResponse = ApiResponse<RepertoireListItem[]>

export function buildPublicTeamScheduleShareUrl(_shareHash?: string): string {
  const shareHash = DEMO_PUBLIC_SHARE_HASH.teamSchedule
  return buildAppAbsoluteUrl(`${PUBLIC_SCHEDULE_SHARE_ROUTE}/${shareHash}`)
}

export function buildPublicMonthlyTeamScheduleShareUrl(_shareHash?: string): string {
  const shareHash = DEMO_PUBLIC_SHARE_HASH.monthlyTeamSchedule
  return buildAppAbsoluteUrl(`${PUBLIC_MONTHLY_SCHEDULE_SHARE_ROUTE}/${shareHash}`)
}

export const teamScheduleService = {
  getMonthly(ministryId: number, year: number, month: number) {
    return demoTeamScheduleApi.getMonthly(ministryId, year, month)
  },

  saveMonthly(payload: SaveMonthlyTeamScheduleRequest) {
    return withDemoMutation(() => demoTeamScheduleApi.saveMonthly(payload))
  },

  generateShareLink(ministryId: number, eventId: number) {
    return withDemoMutation(() => demoTeamScheduleApi.generateShareLink(ministryId, eventId))
  },

  generateMonthlyShareLink(ministryId: number, year: number, month: number) {
    return withDemoMutation(() => demoTeamScheduleApi.generateMonthlyShareLink(ministryId, year, month))
  },

  getPublicMonthlyByShareHash(shareHash: string) {
    return demoTeamScheduleApi.getPublicMonthlyByShareHash(shareHash)
  },

  getPublicByShareHash(shareHash: string) {
    return demoTeamScheduleApi.getPublicByShareHash(shareHash)
  },

  listPublicRepertoires(shareHash: string) {
    return demoTeamScheduleApi.listPublicRepertoires(shareHash)
  }
}

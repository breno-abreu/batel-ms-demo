import { demoTeamScheduleApi } from '@/demo/api/eventDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type { RepertoireListItem } from '@/types/repertoire'
import type {
  MonthlyTeamScheduleResponse,
  PublicMonthlyTeamScheduleResponse,
  SaveMonthlyTeamScheduleRequest
} from '@/types/teamSchedules'

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

export function buildPublicTeamScheduleShareUrl(shareHash: string): string {
  if (typeof window === 'undefined') {
    return `${PUBLIC_SCHEDULE_SHARE_ROUTE}/${shareHash}`
  }

  return `${window.location.origin}${PUBLIC_SCHEDULE_SHARE_ROUTE}/${shareHash}`
}

export function buildPublicMonthlyTeamScheduleShareUrl(shareHash: string): string {
  if (typeof window === 'undefined') {
    return `${PUBLIC_MONTHLY_SCHEDULE_SHARE_ROUTE}/${shareHash}`
  }

  return `${window.location.origin}${PUBLIC_MONTHLY_SCHEDULE_SHARE_ROUTE}/${shareHash}`
}

export const teamScheduleService = {
  getMonthly(ministryId: number, year: number, month: number) {
    if (IS_DEMO_MODE) {
      return demoTeamScheduleApi.getMonthly(ministryId, year, month)
    }

    const params = new URLSearchParams({
      ministryId: String(ministryId),
      year: String(year),
      month: String(month)
    })

    return httpClient.get<MonthlyTeamScheduleResponse>(
      `/api/team-schedules/monthly?${params.toString()}`
    )
  },

  saveMonthly(payload: SaveMonthlyTeamScheduleRequest) {
    if (IS_DEMO_MODE) {
      return demoTeamScheduleApi.saveMonthly(payload)
    }

    return httpClient.put<MonthlyTeamScheduleResponse>(
      '/api/team-schedules/monthly',
      payload,
      { skipErrorRedirect: true }
    )
  },

  generateShareLink(ministryId: number, eventId: number) {
    if (IS_DEMO_MODE) {
      return demoTeamScheduleApi.generateShareLink(ministryId, eventId)
    }

    const params = new URLSearchParams({
      ministryId: String(ministryId),
      eventId: String(eventId)
    })

    return httpClient.post<TeamScheduleShareLinkResponse>(
      `/api/team-schedules/share-link?${params.toString()}`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  generateMonthlyShareLink(ministryId: number, year: number, month: number) {
    if (IS_DEMO_MODE) {
      return demoTeamScheduleApi.generateMonthlyShareLink(ministryId, year, month)
    }

    const params = new URLSearchParams({
      ministryId: String(ministryId),
      year: String(year),
      month: String(month)
    })

    return httpClient.post<TeamScheduleShareLinkResponse>(
      `/api/team-schedules/monthly/share-link?${params.toString()}`,
      undefined,
      { skipErrorRedirect: true }
    )
  },

  getPublicMonthlyByShareHash(shareHash: string) {
    if (IS_DEMO_MODE) {
      return demoTeamScheduleApi.getPublicMonthlyByShareHash(shareHash)
    }

    return httpClient.get<PublicMonthlyTeamScheduleResponse>(
      `/api/public/team-schedules/monthly/${encodeURIComponent(shareHash)}`,
      { skipAuthRefresh: true, skipErrorRedirect: true }
    )
  },

  getPublicByShareHash(shareHash: string) {
    if (IS_DEMO_MODE) {
      return demoTeamScheduleApi.getPublicByShareHash(shareHash)
    }

    return httpClient.get<PublicTeamScheduleResponse>(
      `/api/public/team-schedules/${encodeURIComponent(shareHash)}`,
      { skipAuthRefresh: true, skipErrorRedirect: true }
    )
  },

  listPublicRepertoires(shareHash: string) {
    if (IS_DEMO_MODE) {
      return demoTeamScheduleApi.listPublicRepertoires(shareHash)
    }

    return httpClient.get<PublicTeamScheduleRepertoireListResponse>(
      `/api/public/team-schedules/${encodeURIComponent(shareHash)}/repertoires`,
      { skipAuthRefresh: true, skipErrorRedirect: true }
    )
  }
}

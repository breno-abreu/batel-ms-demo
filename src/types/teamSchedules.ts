import type { ApiResponse } from '@/types/api'
import type { PersonRelatedSkill } from '@/types/people'

export type MinistryMemberForSchedule = {
  id: number
  fullName: string
  preferredName: string | null
  skills: PersonRelatedSkill[]
}

export type ScheduleEventItem = {
  eventId: number
  eventName: string
  eventDate: string
  startTime: string | null
  endTime: string | null
  publicShareHash: string | null
}

export type MonthlyTeamScheduleAssignment = {
  eventId: number
  displayOrder: number
  personId: number
  personName: string
  skillId: number | null
  skillName: string | null
}

export type MonthlyTeamScheduleRepertoire = {
  eventId: number
  displayOrder: number
  repertoireId: number
  songName: string
  author: string | null
  key: string | null
  musicalThemeId: number | null
  musicalThemeName: string | null
}

export type MonthlyTeamScheduleRepertoireGroup = {
  eventId: number
  repertoireGroupId: number
  repertoireGroupName: string
}

export type MonthlyTeamScheduleData = {
  ministryId: number
  ministryName: string
  isMusicMinistry: boolean
  year: number
  month: number
  events: ScheduleEventItem[]
  columnCount: number
  assignments: MonthlyTeamScheduleAssignment[]
  repertoires: MonthlyTeamScheduleRepertoire[]
  repertoireGroups: MonthlyTeamScheduleRepertoireGroup[]
}

export type PublicMonthlyTeamScheduleAssignment = {
  displayOrder: number
  personName: string
  skillName: string | null
}

export type PublicMonthlyTeamScheduleRepertoire = {
  displayOrder: number
  songName: string
  author: string | null
  key: string | null
  musicalThemeName: string | null
}

export type PublicMonthlyTeamScheduleEvent = {
  eventName: string
  eventDate: string
  startTime: string | null
  endTime: string | null
  assignments: PublicMonthlyTeamScheduleAssignment[]
  repertoireGroupName: string | null
  repertoires: PublicMonthlyTeamScheduleRepertoire[]
}

export type PublicMonthlyTeamScheduleData = {
  ministryName: string
  isMusicMinistry: boolean
  year: number
  month: number
  events: PublicMonthlyTeamScheduleEvent[]
}

export type SaveMonthlyTeamScheduleAssignmentRequest = {
  eventId: number
  displayOrder: number
  personId: number
  skillId: number | null
}

export type SaveMonthlyTeamScheduleRepertoireRequest = {
  eventId: number
  displayOrder: number
  repertoireId: number
  musicalThemeId: number | null
}

export type SaveMonthlyTeamScheduleRepertoireGroupRequest = {
  eventId: number
  repertoireGroupId: number
}

export type SaveMonthlyTeamScheduleRequest = {
  ministryId: number
  year: number
  month: number
  columnCount: number
  assignments: SaveMonthlyTeamScheduleAssignmentRequest[]
  repertoires: SaveMonthlyTeamScheduleRepertoireRequest[]
  repertoireGroups: SaveMonthlyTeamScheduleRepertoireGroupRequest[]
}

export type MonthlyTeamScheduleResponse = ApiResponse<MonthlyTeamScheduleData>
export type PublicMonthlyTeamScheduleResponse = ApiResponse<PublicMonthlyTeamScheduleData>
export type MinistryMembersForScheduleResponse = ApiResponse<MinistryMemberForSchedule[]>

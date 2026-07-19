import type { ApiResponse } from '@/types/api'

export type PersonSummary = {
  id: number
  fullName: string
  preferredName: string | null
  ministryIds: number[]
}

export type PersonBirthdayItem = {
  id: number
  fullName: string
  preferredName: string | null
  day: number
  month: number
}

export type PersonBirthdayListResponse = ApiResponse<PersonBirthdayItem[]>

export type PersonListItem = {
  id: number
  fullName: string
  preferredName: string | null
  email: string | null
  mobilePhone: string | null
  isActive: boolean
  ministryCount: number
  skillCount: number
  managedMinistryCount: number
}

export type PersonRelatedMinistry = {
  id: number
  name: string
}

export type PersonRelatedSkill = {
  id: number
  name: string
}

export type PersonManagedMinistry = {
  id: number
  name: string
}

export type PersonEmailAvailability = {
  isAvailable: boolean
  reason: string | null
}

export type PersonDetails = {
  id: number
  fullName: string
  preferredName: string | null
  birthDate: string | null
  email: string | null
  mobilePhone: string | null
  notes: string | null
  isActive: boolean
  ministries: PersonRelatedMinistry[]
  skills: PersonRelatedSkill[]
  managedMinistries: PersonManagedMinistry[]
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type CreatePersonRequest = {
  fullName: string
  preferredName: string | null
  birthDate: string | null
  email: string | null
  mobilePhone: string | null
  notes: string | null
  ministryIds: number[]
  skillIds: number[]
}

export type UpdatePersonRequest = CreatePersonRequest

export type UpdateSelfPersonRequest = {
  fullName: string
  preferredName: string | null
  birthDate: string | null
  mobilePhone: string | null
  notes: string | null
  ministryIds: number[]
  skillIds: number[]
}

export type Ministry = {
  id: number
  name: string
  description: string | null
  personIdManager: number | null
  managerPersonName: string | null
  isActive: boolean
  isMusicMinistry: boolean
  linkedPersonCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type CreateMinistryRequest = {
  name: string
  description: string | null
  personIdManager: number | null
  isMusicMinistry: boolean
}

export type UpdateMinistryRequest = {
  name: string
  description: string | null
  personIdManager: number | null
  isMusicMinistry: boolean
}

export type Skill = {
  id: number
  name: string
  linkedPersonCount: number
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type CreateSkillRequest = {
  name: string
}

export type UpdateSkillRequest = {
  name: string
}

export type PersonSummaryListResponse = ApiResponse<PersonSummary[]>
export type PersonListResponse = ApiResponse<PersonListItem[]>
export type PersonDetailsResponse = ApiResponse<PersonDetails>
export type PersonEmailAvailabilityResponse = ApiResponse<PersonEmailAvailability>
export type MinistryResponse = ApiResponse<Ministry>
export type MinistryListResponse = ApiResponse<Ministry[]>
export type SkillResponse = ApiResponse<Skill>
export type SkillListResponse = ApiResponse<Skill[]>

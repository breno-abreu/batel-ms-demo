import { isValidEmail, normalizeEmail } from '@/utils/email'
import {
  demoMinistries,
  demoPeopleDetails,
  demoPeopleList,
  demoPeopleSummaries,
  demoSkills,
  getDemoBirthdays,
  getDemoMinistryMembers
} from '@/demo/data/people'
import { DEMO_USER } from '@/demo/demoUser'
import { demoMutationOk, demoNotFound, demoOk } from '@/demo/demoHelpers'

export const demoPersonApi = {
  list: async () => demoOk([...demoPeopleList]),
  listForSelection: async () => demoOk([...demoPeopleSummaries]),
  listBirthdays: async (month: number, day?: number) => demoOk(getDemoBirthdays(month, day)),
  checkEmailAvailability: async (email: string) => {
    const normalized = normalizeEmail(email)

    if (!isValidEmail(normalized)) {
      return demoOk({ isAvailable: false, reason: 'Informe um e-mail válido.' })
    }

    const existsInPeople = demoPeopleDetails.some(
      (item) => normalizeEmail(item.email) === normalized
    )
    const existsInList = demoPeopleList.some(
      (item) => normalizeEmail(item.email) === normalized
    )

    if (existsInPeople || existsInList) {
      return demoOk({ isAvailable: false, reason: 'Este e-mail já está cadastrado no sistema.' })
    }

    return demoOk({ isAvailable: true, reason: null })
  },
  getById: async (id: number) => {
    const person = demoPeopleDetails.find((item) => item.id === id)
    return person ? demoOk(person) : demoNotFound()
  },
  getMe: async () => {
    const person = demoPeopleDetails.find((item) => item.id === DEMO_USER.personId) ?? demoPeopleDetails[0]
    return demoOk(person)
  },
  create: async () => demoMutationOk(demoPeopleDetails[0]),
  update: async (id: number) => {
    const person = demoPeopleDetails.find((item) => item.id === id) ?? demoPeopleDetails[0]
    return demoMutationOk(person)
  },
  updateMe: async () => {
    const person = demoPeopleDetails.find((item) => item.id === DEMO_USER.personId) ?? demoPeopleDetails[0]
    return demoMutationOk(person)
  },
  toggleActive: async (id: number) => {
    const person = demoPeopleDetails.find((item) => item.id === id) ?? demoPeopleDetails[0]
    return demoMutationOk(person)
  },
  remove: async () => demoMutationOk(null)
}

export const demoMinistryApi = {
  list: async () => demoOk([...demoMinistries]),
  create: async () => demoMutationOk(demoMinistries[0]),
  update: async (id: number) => {
    const ministry = demoMinistries.find((item) => item.id === id) ?? demoMinistries[0]
    return demoMutationOk(ministry)
  },
  toggleActive: async (id: number) => {
    const ministry = demoMinistries.find((item) => item.id === id) ?? demoMinistries[0]
    return demoMutationOk(ministry)
  },
  remove: async () => demoMutationOk(null),
  listMembersForSchedule: async (id: number) => demoOk(getDemoMinistryMembers(id))
}

export const demoSkillApi = {
  list: async () => demoOk([...demoSkills]),
  create: async () => demoMutationOk(demoSkills[0]),
  update: async (id: number) => {
    const skill = demoSkills.find((item) => item.id === id) ?? demoSkills[0]
    return demoMutationOk(skill)
  },
  remove: async () => demoMutationOk(null)
}

import { DEMO_USER } from '@/demo/demoUser'
import { demoAudit } from '@/demo/demoHelpers'
import type {
  Ministry,
  PersonBirthdayItem,
  PersonDetails,
  PersonListItem,
  PersonSummary,
  Skill
} from '@/types/people'
import type { MinistryMemberForSchedule } from '@/types/teamSchedules'

const firstNames = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fábio', 'Gabriela', 'Henrique',
  'Iris', 'João', 'Karen', 'Lucas', 'Marina', 'Nicolas', 'Olívia', 'Paulo',
  'Queila', 'Rafael', 'Sofia', 'Tiago', 'Úrsula', 'Vinícius', 'Wendy', 'Yuri'
]

const lastNames = [
  'Silva', 'Souza', 'Oliveira', 'Santos', 'Ferreira', 'Almeida', 'Costa', 'Rocha',
  'Martins', 'Pereira', 'Lima', 'Araújo'
]

export const demoSkills: Skill[] = [
  'Vocal', 'Violão', 'Teclado', 'Bateria', 'Som', 'Projeção', 'Recepção', 'Liderança'
].map((name, index) => ({
  id: index + 1,
  name,
  linkedPersonCount: 3 + (index % 4),
  ...demoAudit
}))

export const demoMinistries: Ministry[] = [
  {
    id: 1,
    name: 'Louvor',
    description: 'Ministério de música e adoração',
    personIdManager: 1,
    managerPersonName: 'Usuário Demonstração',
    isActive: true,
    isMusicMinistry: true,
    linkedPersonCount: 12,
    ...demoAudit
  },
  {
    id: 2,
    name: 'Diaconato',
    description: 'Apoio e organização dos cultos',
    personIdManager: 2,
    managerPersonName: 'Ana Silva',
    isActive: true,
    isMusicMinistry: false,
    linkedPersonCount: 8,
    ...demoAudit
  },
  {
    id: 3,
    name: 'Comunicação',
    description: 'Mídias e transmissão',
    personIdManager: 3,
    managerPersonName: 'Bruno Souza',
    isActive: true,
    isMusicMinistry: false,
    linkedPersonCount: 6,
    ...demoAudit
  },
  {
    id: 4,
    name: 'Jovens',
    description: 'Atividades com juventude',
    personIdManager: 4,
    managerPersonName: 'Carla Oliveira',
    isActive: true,
    isMusicMinistry: false,
    linkedPersonCount: 10,
    ...demoAudit
  },
  {
    id: 5,
    name: 'Infantil',
    description: 'Escola sabatina infantil',
    personIdManager: 5,
    managerPersonName: 'Diego Santos',
    isActive: false,
    isMusicMinistry: false,
    linkedPersonCount: 4,
    ...demoAudit
  }
]

function buildPersonName(index: number): { fullName: string; preferredName: string } {
  if (index === 0) {
    return { fullName: DEMO_USER.fullName, preferredName: DEMO_USER.preferredName ?? 'Demo' }
  }

  const first = firstNames[(index - 1) % firstNames.length]
  const last = lastNames[(index - 1) % lastNames.length]
  return { fullName: `${first} ${last}`, preferredName: first }
}

export const demoPeopleDetails: PersonDetails[] = Array.from({ length: 24 }, (_, index) => {
  const id = index + 1
  const { fullName, preferredName } = buildPersonName(index)
  const ministry = demoMinistries[index % demoMinistries.length]
  const skillA = demoSkills[index % demoSkills.length]
  const skillB = demoSkills[(index + 2) % demoSkills.length]
  const birthMonth = ((index % 12) + 1).toString().padStart(2, '0')
  const birthDay = ((index % 27) + 1).toString().padStart(2, '0')

  return {
    id,
    fullName,
    preferredName,
    birthDate: `199${index % 10}-${birthMonth}-${birthDay}`,
    email: id === 1 ? DEMO_USER.email : `${preferredName.toLowerCase()}.${id}@demo.batelms.app`,
    mobilePhone: `(41) 9${String(8000 + id).padStart(4, '0')}-${String(1000 + id).padStart(4, '0')}`,
    notes: index % 3 === 0 ? 'Participante ativo nas escalas.' : null,
    isActive: index !== 20,
    ministries: [{ id: ministry.id, name: ministry.name }],
    skills: [
      { id: skillA.id, name: skillA.name },
      { id: skillB.id, name: skillB.name }
    ],
    managedMinistries: demoMinistries
      .filter((item) => item.personIdManager === id)
      .map((item) => ({ id: item.id, name: item.name })),
    ...demoAudit
  }
})

export const demoPeopleList: PersonListItem[] = demoPeopleDetails.map((person) => ({
  id: person.id,
  fullName: person.fullName,
  preferredName: person.preferredName,
  email: person.email,
  mobilePhone: person.mobilePhone,
  isActive: person.isActive,
  ministryCount: person.ministries.length,
  skillCount: person.skills.length,
  managedMinistryCount: person.managedMinistries.length
}))

export const demoPeopleSummaries: PersonSummary[] = demoPeopleDetails
  .filter((person) => person.isActive)
  .map((person) => ({
    id: person.id,
    fullName: person.fullName,
    preferredName: person.preferredName,
    ministryIds: person.ministries.map((ministry) => ministry.id)
  }))

export function getDemoBirthdays(month: number, day?: number): PersonBirthdayItem[] {
  return demoPeopleDetails
    .filter((person) => {
      if (!person.birthDate) {
        return false
      }

      const [, m, d] = person.birthDate.split('-').map(Number)

      if (m !== month) {
        return false
      }

      if (day != null && d !== day) {
        return false
      }

      return true
    })
    .map((person) => {
      const [, m, d] = person.birthDate!.split('-').map(Number)
      return {
        id: person.id,
        fullName: person.fullName,
        preferredName: person.preferredName,
        day: d,
        month: m
      }
    })
}

export function getDemoMinistryMembers(ministryId: number): MinistryMemberForSchedule[] {
  return demoPeopleDetails
    .filter((person) => person.isActive && person.ministries.some((m) => m.id === ministryId))
    .map((person) => ({
      id: person.id,
      fullName: person.fullName,
      preferredName: person.preferredName,
      skills: person.skills
    }))
}

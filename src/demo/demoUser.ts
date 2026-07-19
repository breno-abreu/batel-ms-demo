/** Usuário fixo da demonstração — sem sessão, tokens ou autenticação. */
export type DemoUser = {
  id: number
  personId: number
  email: string
  fullName: string
  preferredName: string | null
}

export const DEMO_USER: DemoUser = {
  id: 1,
  personId: 1,
  email: 'demo@batelms.app',
  fullName: 'Usuário Demonstração',
  preferredName: 'Demo'
}

export function getDemoDisplayName(user: DemoUser = DEMO_USER): string {
  return user.preferredName?.trim() || user.fullName
}

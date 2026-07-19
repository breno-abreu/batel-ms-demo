export type PasswordRequirement = {
  id: string
  label: string
  met: boolean
}

export type PasswordStrengthLevel = 'empty' | 'weak' | 'medium' | 'strong'

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      id: 'length',
      label: 'Mínimo de 8 caracteres',
      met: password.length >= 8
    },
    {
      id: 'uppercase',
      label: 'Letra maiúscula',
      met: /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      label: 'Letra minúscula',
      met: /[a-z]/.test(password)
    },
    {
      id: 'number',
      label: 'Pelo menos um número',
      met: /\d/.test(password)
    }
  ]
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRequirements(password).every((requirement) => requirement.met)
}

export function getPasswordStrengthLevel(password: string): PasswordStrengthLevel {
  if (!password) {
    return 'empty'
  }

  const metCount = getPasswordRequirements(password).filter((requirement) => requirement.met).length

  if (metCount < 4) {
    return 'weak'
  }

  if (password.length >= 12) {
    return 'strong'
  }

  return 'medium'
}

export function getPasswordStrengthLabel(level: PasswordStrengthLevel): string {
  switch (level) {
    case 'weak':
      return 'Fraca'
    case 'medium':
      return 'Média'
    case 'strong':
      return 'Forte'
    default:
      return ''
  }
}

export function getPasswordStrengthPercent(level: PasswordStrengthLevel): number {
  switch (level) {
    case 'weak':
      return 33
    case 'medium':
      return 66
    case 'strong':
      return 100
    default:
      return 0
  }
}

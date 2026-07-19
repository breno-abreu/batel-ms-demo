import { demoAudit } from '@/demo/demoHelpers'
import { Permissions } from '@/utils/permissions'
import type { AccessRole, RolePermissionsMatrix } from '@/types/roles'

export const demoRoles: AccessRole[] = [
  'People Manager',
  'Content Manager',
  'Worship Manager',
  'Request Manager',
  'Data Analyst',
  'Event Manager'
].map((name, index) => ({
  id: index + 1,
  name,
  isActive: true,
  ...demoAudit
}))

const allPermissionNames = Object.values(Permissions)

export function getDemoRolePermissions(roleId: number): RolePermissionsMatrix | null {
  const role = demoRoles.find((item) => item.id === roleId)

  if (!role) {
    return null
  }

  return {
    roleId: role.id,
    roleName: role.name,
    permissions: allPermissionNames.map((name, index) => ({
      id: index + 1,
      name,
      isGranted: (index + roleId) % 3 !== 0
    }))
  }
}

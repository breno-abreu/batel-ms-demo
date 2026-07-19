import type { ApiResponse } from '@/types/auth'

export type AccessRole = {
  id: number
  name: string
  isActive: boolean
  createdAt: string
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  deletedAt: string | null
  deletedBy: number | null
}

export type RolePermissionGrant = {
  id: number
  name: string
  isGranted: boolean
}

export type RolePermissionsMatrix = {
  roleId: number
  roleName: string
  permissions: RolePermissionGrant[]
}

export type UpdateRolePermissionsPayload = {
  permissionIds: number[]
}

export type AccessRoleListResponse = ApiResponse<AccessRole[]>
export type RolePermissionsMatrixResponse = ApiResponse<RolePermissionsMatrix>

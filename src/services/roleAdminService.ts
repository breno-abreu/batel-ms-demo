import { demoRoleAdminApi } from '@/demo/api/miscDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type {
  AccessRoleListResponse,
  RolePermissionsMatrixResponse,
  UpdateRolePermissionsPayload
} from '@/types/roles'

export const roleAdminService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoRoleAdminApi.list()
    }

    return httpClient.get<AccessRoleListResponse>('/api/admin/roles')
  },

  getPermissions(roleId: number) {
    if (IS_DEMO_MODE) {
      return demoRoleAdminApi.getPermissions(roleId)
    }

    return httpClient.get<RolePermissionsMatrixResponse>(
      `/api/admin/roles/${roleId}/permissions`
    )
  },

  updatePermissions(roleId: number, payload: UpdateRolePermissionsPayload) {
    if (IS_DEMO_MODE) {
      return demoRoleAdminApi.updatePermissions(roleId)
    }

    return httpClient.put<RolePermissionsMatrixResponse>(
      `/api/admin/roles/${roleId}/permissions`,
      payload,
      { skipErrorRedirect: true }
    )
  }
}

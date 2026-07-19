<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <ShieldCheckIcon :size="20" />
          </span>
          <h1>Permissões</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Selecione um perfil de acesso e ajuste as permissões vinculadas a ele.
          Novos perfis só podem ser criados diretamente no banco de dados.
        </p>
      </div>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-form__field">
        <label class="repertoire-form__field-label" for="role-select">
          Perfil de acesso
        </label>
        <select
          id="role-select"
          class="field-control"
          :value="selectedRoleId ?? ''"
          :disabled="rolesLoading || saving || roleChangePromptOpen"
          @change="handleRoleChange"
        >
          <option value="" disabled>
            {{ rolesLoading ? 'Carregando perfis...' : 'Selecione um perfil' }}
          </option>
          <option
            v-for="role in roles"
            :key="role.id"
            :value="role.id"
          >
            {{ getRoleDisplayName(role.name) }}
          </option>
        </select>
      </div>
    </section>

    <AppListSkeleton
      v-if="matrixLoading"
      :rows="8"
    />

    <form
      v-else-if="selectedRoleId !== null && matrix"
      ref="permissionsForm"
      v-unsaved-changes
      class="repertoire-card"
      @submit.prevent="handleSave"
    >
      <div class="repertoire-card__title-row">
        <h2>
          Permissões de {{ getRoleDisplayName(matrix.roleName) }}
        </h2>
        <span class="repertoire-badge">
          {{ selectedCount }}/{{ permissionTotalCount }}
        </span>
      </div>

      <p class="description">
        Marque as permissões que este perfil deve conceder além do acesso padrão
        de qualquer usuário autenticado.
      </p>

      <div
        v-if="permissionGroups.length > 0"
        class="permissions-matrix"
        role="group"
        :aria-label="`Permissões do perfil ${getRoleDisplayName(matrix.roleName)}`"
      >
        <section
          v-for="group in permissionGroups"
          :key="group.name"
          class="permissions-matrix__group"
        >
          <header class="permissions-matrix__group-header">
            <h3 class="permissions-matrix__group-title">
              {{ group.name }}
            </h3>
            <span class="permissions-matrix__group-count">
              {{ group.selectedCount }}/{{ group.permissions.length }}
            </span>
          </header>

          <div class="permissions-matrix__list">
            <label
              v-for="permission in group.permissions"
              :key="permission.id"
              class="permissions-matrix__item"
              :class="{
                'permissions-matrix__item--selected': isPermissionSelected(permission.id),
                'permissions-matrix__item--disabled': saving
              }"
            >
              <input
                class="permissions-matrix__input"
                type="checkbox"
                :checked="isPermissionSelected(permission.id)"
                :disabled="saving"
                @change="togglePermission(permission.id, $event)"
              >
              <span
                class="permissions-matrix__check"
                aria-hidden="true"
              >
                <CheckIcon
                  v-if="isPermissionSelected(permission.id)"
                  :size="14"
                />
              </span>
              <span class="permissions-matrix__content">
                <span class="permissions-matrix__label">
                  {{ getPermissionDisplayName(permission.name) }}
                </span>
                <span class="permissions-matrix__key">{{ permission.name }}</span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <p v-else class="description">
        Nenhuma permissão cadastrada no sistema.
      </p>

      <div class="repertoire-form__actions permissions-matrix__actions">
        <button
          type="button"
          class="field-button field-button--ghost"
          data-unsaved-close
          :disabled="saving || !hasChanges"
          @click="resetSelection"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="repertoire-button"
          :disabled="saving || !hasChanges"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CheckIcon, ShieldCheckIcon } from '@lucide/vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import { roleAdminService } from '@/services/roleAdminService'
import { toastService } from '@/services/toastService'
import { promptUnsavedChanges } from '@/services/unsavedChangesPrompt'
import { unsavedChangesStore } from '@/stores/unsavedChangesStore'
import type { AccessRole, RolePermissionGrant, RolePermissionsMatrix } from '@/types/roles'
import {
  getPermissionDisplayName,
  getPermissionGroupName,
  getRoleDisplayName
} from '@/utils/roleLabels'

type PermissionGroupView = {
  name: string
  permissions: RolePermissionGrant[]
  selectedCount: number
}

export default defineComponent({
  name: 'PermissionsAdminView',
  components: {
    AppListSkeleton,
    CheckIcon,
    ShieldCheckIcon
  },
  data() {
    return {
      roles: [] as AccessRole[],
      rolesLoading: false,
      matrixLoading: false,
      saving: false,
      roleChangePromptOpen: false,
      selectedRoleId: null as number | null,
      matrix: null as RolePermissionsMatrix | null,
      selectedPermissionIds: [] as number[],
      initialPermissionIds: [] as number[],
      matrixRequestId: 0,
      activeSavePromise: null as Promise<boolean> | null
    }
  },
  computed: {
    selectedCount(): number {
      return this.selectedPermissionIds.length
    },
    permissionTotalCount(): number {
      return this.matrix?.permissions?.length ?? 0
    },
    hasChanges(): boolean {
      if (this.selectedPermissionIds.length !== this.initialPermissionIds.length) {
        return true
      }

      const initialSet = new Set(this.initialPermissionIds)
      return this.selectedPermissionIds.some((id) => !initialSet.has(id))
    },
    permissionGroups(): PermissionGroupView[] {
      const permissions = this.matrix?.permissions

      if (!Array.isArray(permissions) || permissions.length === 0) {
        return []
      }

      const groups = new Map<string, RolePermissionGrant[]>()
      const selectedSet = new Set(this.selectedPermissionIds)

      for (const permission of permissions) {
        if (!permission || typeof permission.id !== 'number') {
          continue
        }

        const groupName = getPermissionGroupName(permission.name)
        const current = groups.get(groupName) ?? []
        current.push(permission)
        groups.set(groupName, current)
      }

      return Array.from(groups.entries()).map(([name, groupPermissions]) => ({
        name,
        permissions: groupPermissions,
        selectedCount: groupPermissions.filter((permission) =>
          selectedSet.has(permission.id)
        ).length
      }))
    }
  },
  created() {
    void this.loadRoles()
  },
  watch: {
    selectedPermissionIds() {
      void this.$nextTick(() => this.syncDirtyState())
    }
  },
  methods: {
    getRoleDisplayName,
    getPermissionDisplayName,

    isPermissionSelected(permissionId: number): boolean {
      return this.selectedPermissionIds.includes(permissionId)
    },

    applyMatrix(matrix: RolePermissionsMatrix): void {
      const permissions = Array.isArray(matrix.permissions) ? matrix.permissions : []

      this.matrix = {
        ...matrix,
        permissions
      }
      this.selectedPermissionIds = permissions
        .filter((item) => item.isGranted)
        .map((item) => item.id)
      this.initialPermissionIds = [...this.selectedPermissionIds]
    },

    async loadRoles(): Promise<void> {
      this.rolesLoading = true

      try {
        const response = await roleAdminService.list()
        this.roles = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar os perfis de acesso.'
        )
      } finally {
        this.rolesLoading = false
      }
    },

    async handleRoleChange(event: Event): Promise<void> {
      const target = event.target as HTMLSelectElement
      const value = target.value
      const previousRoleId = this.selectedRoleId

      if (this.roleChangePromptOpen) {
        target.value = previousRoleId?.toString() ?? ''
        return
      }

      const roleId = value ? Number(value) : null

      if (roleId === previousRoleId || (roleId !== null && Number.isNaN(roleId))) {
        target.value = previousRoleId?.toString() ?? ''
        return
      }

      const form = this.$refs.permissionsForm as HTMLFormElement | undefined
      const dirtySources = form ? unsavedChangesStore.getDirtySources(form) : []

      if (dirtySources.length > 0) {
        this.roleChangePromptOpen = true

        try {
          const choice = await promptUnsavedChanges()

          if (choice === 'dismiss') {
            target.value = previousRoleId?.toString() ?? ''
            return
          }

          if (choice === 'confirm') {
            const saved = await unsavedChangesStore.save(dirtySources)

            if (!saved) {
              target.value = previousRoleId?.toString() ?? ''
              return
            }
          } else {
            this.resetSelection()
          }
        } finally {
          this.roleChangePromptOpen = false
        }
      }

      if (roleId === null) {
        this.clearMatrixState()
        return
      }

      this.selectedRoleId = roleId
      await this.loadMatrix(roleId)
    },

    clearMatrixState(): void {
      this.matrixRequestId += 1
      this.clearDirtyState()
      this.selectedRoleId = null
      this.matrix = null
      this.selectedPermissionIds = []
      this.initialPermissionIds = []
      this.matrixLoading = false
    },

    async loadMatrix(roleId: number): Promise<void> {
      const requestId = this.matrixRequestId + 1
      this.matrixRequestId = requestId
      this.clearDirtyState()
      this.matrixLoading = true
      this.matrix = null
      this.selectedPermissionIds = []
      this.initialPermissionIds = []

      try {
        const response = await roleAdminService.getPermissions(roleId)
        const matrix = response.payload

        if (requestId !== this.matrixRequestId || this.selectedRoleId !== roleId) {
          return
        }

        if (!matrix) {
          throw new Error('Não foi possível carregar as permissões do perfil.')
        }

        this.applyMatrix(matrix)
      } catch (error) {
        if (requestId !== this.matrixRequestId) {
          return
        }

        this.clearMatrixState()
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar as permissões do perfil.'
        )
      } finally {
        if (requestId === this.matrixRequestId) {
          this.matrixLoading = false
        }
      }
    },

    togglePermission(permissionId: number, event: Event): void {
      const target = event.target as HTMLInputElement
      const shouldSelect = Boolean(target?.checked)

      if (shouldSelect) {
        if (!this.selectedPermissionIds.includes(permissionId)) {
          this.selectedPermissionIds = [...this.selectedPermissionIds, permissionId]
        }
      } else {
        this.selectedPermissionIds = this.selectedPermissionIds.filter(
          (id) => id !== permissionId
        )
      }

      void this.$nextTick(() => this.syncDirtyState())
    },

    resetSelection(): void {
      this.selectedPermissionIds = [...this.initialPermissionIds]
      this.clearDirtyState()
    },

    syncDirtyState(): void {
      const form = this.$refs.permissionsForm as HTMLFormElement | undefined

      if (!form) {
        return
      }

      if (this.hasChanges) {
        unsavedChangesStore.markDirty(form)
        return
      }

      unsavedChangesStore.markClean(form)
    },

    clearDirtyState(): void {
      const form = this.$refs.permissionsForm as HTMLFormElement | undefined

      if (form) {
        unsavedChangesStore.markClean(form)
      }
    },

    async handleSave(): Promise<boolean> {
      if (this.activeSavePromise) {
        return this.activeSavePromise
      }

      const savePromise = this.savePermissions()
      this.activeSavePromise = savePromise

      try {
        return await savePromise
      } finally {
        if (this.activeSavePromise === savePromise) {
          this.activeSavePromise = null
        }
      }
    },

    async savePermissions(): Promise<boolean> {
      if (this.selectedRoleId === null || !this.hasChanges) {
        this.clearDirtyState()
        return true
      }

      this.saving = true

      try {
        const response = await roleAdminService.updatePermissions(this.selectedRoleId, {
          permissionIds: [...this.selectedPermissionIds]
        })

        const matrix = response.payload

        if (!matrix) {
          throw new Error('Não foi possível salvar as permissões do perfil.')
        }

        this.applyMatrix(matrix)
        // Limpa depois do DOM atualizar os checkboxes, para não remarcar como sujo.
        await this.$nextTick()
        this.clearDirtyState()
        toastService.success(response.message || 'Permissões atualizadas com sucesso.')
        return true
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao salvar as permissões do perfil.'
        )
        return false
      } finally {
        this.saving = false
      }
    }
  }
})
</script>

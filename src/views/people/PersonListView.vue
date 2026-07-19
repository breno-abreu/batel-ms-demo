<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <UsersIcon :size="20" />
          </span>
          <h1>Pessoas</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Consulte e gerencie o cadastro de pessoas, ministérios e habilidades.
        </p>
      </div>

      <RouterLink
        v-if="canManagePeople"
        class="repertoire-button"
        :to="{ name: 'people-details', params: { id: 'new' } }"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Nova pessoa
      </RouterLink>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Pessoas cadastradas</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>

      <AppListSkeleton
        v-if="listLoading"
        show-search
        :action-count="3"
      />

      <template v-else>
        <div
          v-if="items.length > 0"
          class="repertoire-list-search"
        >
          <SearchIcon
            class="repertoire-list-search__icon"
            :size="16"
            aria-hidden="true"
          />
          <input
            id="people-search"
            v-model="searchQuery"
            type="search"
            class="field-control repertoire-list-search__input"
            placeholder="Buscar por nome, e-mail ou telefone..."
            aria-label="Buscar pessoas"
          >
        </div>

        <p v-if="items.length === 0" class="description">
          Nenhuma pessoa cadastrada.
        </p>

        <p v-else-if="filteredItems.length === 0" class="description">
          Nenhuma pessoa encontrada para a busca.
        </p>

        <ul v-else class="sortable-list" role="list">
          <li
            v-for="item in filteredItems"
            :key="item.id"
            class="sortable-list__item"
            role="listitem"
          >
            <div class="sortable-list__info">
              <RouterLink
                class="sortable-list__name sortable-list__name--link"
                :to="{ name: 'people-details', params: { id: item.id } }"
              >
                {{ formatPersonName(item) }}
              </RouterLink>
              <span
                class="sortable-list__description"
                :class="{ 'sortable-list__description--empty': !getItemDescription(item) }"
              >
                {{ getItemDescription(item) || 'Sem contato informado' }}
              </span>
            </div>
            <div class="sortable-list__actions">
              <AppTooltip text="Ver detalhes">
                <RouterLink
                  class="sortable-list__action"
                  :to="{ name: 'people-details', params: { id: item.id } }"
                  aria-label="Ver detalhes"
                >
                  <EyeIcon :size="16" aria-hidden="true" />
                </RouterLink>
              </AppTooltip>
              <AppTooltip
                v-if="canManagePeople"
                :text="item.isActive ? 'Desativar pessoa' : 'Ativar pessoa'"
              >
                <button
                  type="button"
                  class="sortable-list__action"
                  :disabled="actionLoadingId === item.id"
                  :aria-label="item.isActive ? 'Desativar pessoa' : 'Ativar pessoa'"
                  @click="handleToggleActive(item)"
                >
                  <PowerIcon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
              <AppTooltip
                v-if="canManagePeople"
                :text="getDeleteTooltip(item)"
              >
                <button
                  type="button"
                  class="sortable-list__action sortable-list__action--danger"
                  :disabled="actionLoadingId === item.id || !canDelete(item)"
                  :aria-label="canDelete(item) ? 'Excluir pessoa' : getDeleteTooltip(item)"
                  @click="handleDelete(item)"
                >
                  <Trash2Icon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
            </div>
            <span
              class="repertoire-status sortable-list__status"
              :class="{ 'repertoire-status--inactive': !item.isActive }"
            >
              {{ item.isActive ? 'Ativo' : 'Inativo' }}
            </span>
          </li>
        </ul>
      </template>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import {
  EyeIcon,
  PlusIcon,
  PowerIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon
} from '@lucide/vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { personService } from '@/services/personService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type { PersonListItem } from '@/types/people'
import { Permissions } from '@/utils/permissions'
import { formatBrazilianMobilePhone } from '@/utils/phone'

export default defineComponent({
  name: 'PersonListView',
  components: {
    AppListSkeleton,
    AppTooltip,
    EyeIcon,
    PlusIcon,
    PowerIcon,
    RouterLink,
    SearchIcon,
    Trash2Icon,
    UsersIcon
  },
  data() {
    return {
      items: [] as PersonListItem[],
      searchQuery: '',
      listLoading: false,
      actionLoadingId: null as number | null
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    isAdmin(): boolean {
      return this.authStore.isAdmin
    },
    canManagePeople(): boolean {
      return this.authStore.hasPermission(Permissions.PeopleManage)
    },
    normalizedSearchQuery(): string {
      return this.searchQuery.trim().toLocaleLowerCase('pt-BR')
    },
    filteredItems(): PersonListItem[] {
      if (!this.normalizedSearchQuery) {
        return this.items
      }

      return this.items.filter((item) => {
        const fullName = item.fullName.toLocaleLowerCase('pt-BR')
        const preferredName = (item.preferredName ?? '').toLocaleLowerCase('pt-BR')
        const email = (item.email ?? '').toLocaleLowerCase('pt-BR')
        const mobilePhone = formatBrazilianMobilePhone(item.mobilePhone)
          .toLocaleLowerCase('pt-BR')

        return fullName.includes(this.normalizedSearchQuery)
          || preferredName.includes(this.normalizedSearchQuery)
          || email.includes(this.normalizedSearchQuery)
          || mobilePhone.includes(this.normalizedSearchQuery)
      })
    },
    listCountLabel(): string {
      if (this.normalizedSearchQuery) {
        return `${this.filteredItems.length} de ${this.items.length}`
      }

      return String(this.items.length)
    }
  },
  mounted() {
    void this.loadItems()
  },
  methods: {
    async loadItems(): Promise<void> {
      this.listLoading = true

      try {
        const response = await personService.list()
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar as pessoas.'
        )
      } finally {
        this.listLoading = false
      }
    },

    formatPersonName(item: PersonListItem): string {
      if (item.preferredName) {
        return `${item.fullName} (${item.preferredName})`
      }

      return item.fullName
    },

    getItemDescription(item: PersonListItem): string {
      const parts: string[] = []

      if (item.email) {
        parts.push(item.email)
      }

      if (item.mobilePhone) {
        parts.push(formatBrazilianMobilePhone(item.mobilePhone))
      }

      if (item.ministryCount > 0) {
        parts.push(`${item.ministryCount} ministério${item.ministryCount > 1 ? 's' : ''}`)
      }

      if (item.skillCount > 0) {
        parts.push(`${item.skillCount} habilidade${item.skillCount > 1 ? 's' : ''}`)
      }

      if (item.hasSystemUser) {
        parts.push('Usuário do sistema')
      }

      return parts.join(' · ')
    },

    canDelete(item: PersonListItem): boolean {
      return !item.hasSystemUser
        && item.ministryCount === 0
        && item.skillCount === 0
        && item.managedMinistryCount === 0
    },

    getDeleteTooltip(item: PersonListItem): string {
      if (item.hasSystemUser) {
        return 'Não é possível excluir uma pessoa com usuário do sistema vinculado'
      }

      if (item.managedMinistryCount > 0) {
        return 'Não é possível excluir uma pessoa responsável por ministérios'
      }

      if (item.ministryCount > 0) {
        return 'Não é possível excluir uma pessoa vinculada a ministérios'
      }

      if (item.skillCount > 0) {
        return 'Não é possível excluir uma pessoa vinculada a habilidades'
      }

      return 'Excluir pessoa'
    },

    async handleToggleActive(item: PersonListItem): Promise<void> {
      if (!this.canManagePeople) {
        return
      }

      if (item.isActive) {
        const confirmed = await confirmDialogService.confirm({
          title: 'Desativar pessoa',
          message: item.hasSystemUser
            ? `Deseja desativar "${this.formatPersonName(item)}"? A pessoa perderá o acesso ao sistema e de administrador, e não poderá mais fazer login. Essa ação pode ser revertida depois, reativando a pessoa e concedendo o acesso novamente.`
            : `Deseja desativar "${this.formatPersonName(item)}"? Essa ação pode ser revertida depois, reativando a pessoa.`,
          confirmLabel: 'Desativar',
          cancelLabel: 'Cancelar',
          tone: 'danger'
        })

        if (!confirmed) {
          return
        }
      }

      this.actionLoadingId = item.id

      try {
        const response = await personService.toggleActive(item.id)
        const updatedItem = response.payload

        if (updatedItem) {
          this.items = this.items.map((currentItem) =>
            currentItem.id === item.id
              ? {
                  ...currentItem,
                  isActive: updatedItem.isActive
                }
              : currentItem
          )
        }

        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao alterar o status da pessoa.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    async handleDelete(item: PersonListItem): Promise<void> {
      if (!this.canManagePeople || !this.canDelete(item)) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir pessoa',
        message: `Deseja excluir "${this.formatPersonName(item)}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await personService.remove(item.id)
        this.items = this.items.filter((currentItem) => currentItem.id !== item.id)
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir a pessoa.'
        )
      } finally {
        this.actionLoadingId = null
      }
    }
  }
})
</script>

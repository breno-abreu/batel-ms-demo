<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <FolderIcon :size="20" />
          </span>
          <h1>Pastas de links úteis</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Organize links úteis em pastas públicas ou privadas.
        </p>
      </div>
      <button
        v-if="!createFormVisible && canCreateGroup"
        type="button"
        class="repertoire-button"
        @click="openCreateForm"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Nova pasta
      </button>
      <button
        v-else
        type="button"
        class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
        @click="requestCloseCreateForm"
      >
        <ArrowLeftIcon :size="16" aria-hidden="true" />
        Voltar para pastas
      </button>
    </header>
    <Transition name="repertoire-panel-reveal">
      <section v-if="createFormVisible" class="repertoire-card repertoire-card--create">
        <h2>Cadastro</h2>
        <form
          ref="createForm"
          v-unsaved-changes
          class="repertoire-form"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <label>
            Nome *
            <input
              id="useful-link-group-name"
              v-model="form.name"
              type="text"
              class="field-control"
              :maxlength="nameMaxLength"
              placeholder="Ex.: Links da secretaria"
              :class="{ 'field-control--invalid': nameError }"
              :aria-invalid="nameError ? 'true' : 'false'"
              :aria-describedby="nameFieldDescribedBy"
              @input="clearNameError"
            >
            <span
              id="useful-link-group-name-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.name.length }}/{{ nameMaxLength }}
            </span>
            <span
              v-if="nameError"
              id="useful-link-group-name-error"
              class="field-error"
              role="alert"
            >
              {{ nameError }}
            </span>
          </label>
          <label>
            Descrição
            <textarea
              id="useful-link-group-description"
              v-model="form.description"
              rows="3"
              class="field-control"
              :maxlength="descriptionMaxLength"
              placeholder="Descrição opcional da pasta"
              aria-describedby="useful-link-group-description-counter"
            />
            <span
              id="useful-link-group-description-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.description.length }}/{{ descriptionMaxLength }}
            </span>
          </label>
          <fieldset class="repertoire-folder-visibility">
            <legend class="repertoire-folder-visibility__label">
              Visibilidade
            </legend>
            <div
              class="repertoire-folder-visibility__options"
              role="radiogroup"
              aria-label="Visibilidade da pasta"
            >
              <button
                type="button"
                data-unsaved-change
                class="repertoire-folder-visibility__option"
                :class="{ 'repertoire-folder-visibility__option--selected': form.isPublic }"
                role="radio"
                :aria-checked="form.isPublic ? 'true' : 'false'"
                @click="selectPublicVisibility"
              >
                <GlobeIcon :size="22" aria-hidden="true" />
                <span class="repertoire-folder-visibility__option-title">Pública</span>
                <span class="repertoire-folder-visibility__option-hint">
                  Visível para usuários logados no Bless App
                </span>
              </button>
              <button
                type="button"
                data-unsaved-change
                class="repertoire-folder-visibility__option"
                :class="{ 'repertoire-folder-visibility__option--selected': !form.isPublic }"
                role="radio"
                :aria-checked="!form.isPublic ? 'true' : 'false'"
                @click="selectPrivateVisibility"
              >
                <LockIcon :size="22" aria-hidden="true" />
                <span class="repertoire-folder-visibility__option-title">Privada</span>
                <span class="repertoire-folder-visibility__option-hint">
                  Apenas você pode ver esta pasta
                </span>
              </button>
            </div>
          </fieldset>
          <fieldset
            v-if="form.isPublic"
            class="repertoire-folder-access"
          >
            <legend class="repertoire-folder-access__label">
              Acesso à pasta pública
            </legend>
            <div
              class="repertoire-folder-access__options"
              role="radiogroup"
              aria-label="Acesso à pasta pública"
            >
              <button
                type="button"
                data-unsaved-change
                class="repertoire-folder-access__option"
                :class="{ 'repertoire-folder-access__option--selected': !form.allowPublicLinkAccess }"
                role="radio"
                :aria-checked="!form.allowPublicLinkAccess ? 'true' : 'false'"
                @click="form.allowPublicLinkAccess = false"
              >
                <UsersIcon :size="20" aria-hidden="true" />
                <span class="repertoire-folder-access__option-title">Usuários logados</span>
                <span class="repertoire-folder-access__option-hint">
                  Somente quem entrou no sistema
                </span>
              </button>
              <button
                type="button"
                data-unsaved-change
                class="repertoire-folder-access__option"
                :class="{ 'repertoire-folder-access__option--selected': form.allowPublicLinkAccess }"
                role="radio"
                :aria-checked="form.allowPublicLinkAccess ? 'true' : 'false'"
                @click="form.allowPublicLinkAccess = true"
              >
                <Link2Icon :size="20" aria-hidden="true" />
                <span class="repertoire-folder-access__option-title">Link externo</span>
                <span class="repertoire-folder-access__option-hint">
                  Qualquer pessoa com o link, sem login
                </span>
              </button>
            </div>
          </fieldset>
          <div class="repertoire-form__actions">
            <button
              type="button"
              class="field-button field-button--ghost"
              :disabled="loading"
              @click="requestCloseCreateForm"
            >
              Cancelar
            </button>
            <button type="submit" class="repertoire-button" :disabled="loading">
              {{ loading ? 'Salvando...' : 'Cadastrar' }}
            </button>
          </div>
        </form>
      </section>
    </Transition>
    <section v-if="!createFormVisible" class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Pastas cadastradas</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>
      <div
        v-if="listLoading"
        class="repertoire-folder-grid repertoire-folder-grid--skeleton"
        aria-hidden="true"
      >
        <div
          v-for="index in 6"
          :key="index"
          class="repertoire-folder-card repertoire-folder-card--skeleton"
        >
          <span class="app-skeleton app-skeleton--action" />
          <span class="app-skeleton app-skeleton--title" />
          <span class="app-skeleton app-skeleton--description" />
        </div>
      </div>
      <template v-else>
        <div
          v-if="showToolbar"
          class="repertoire-list-toolbar"
        >
          <div class="repertoire-list-search-row">
            <div
              class="repertoire-list-search"
              :class="{ 'repertoire-list-search--loading': isSearchPending }"
            >
              <SearchIcon
                class="repertoire-list-search__icon"
                :size="16"
                aria-hidden="true"
              />
              <input
                id="useful-link-group-search"
                v-model="searchQuery"
                type="search"
                class="field-control repertoire-list-search__input"
                placeholder="Buscar por nome ou descrição..."
                aria-label="Buscar pastas"
                :disabled="listRefreshing"
              >
              <span
                v-if="isSearchPending"
                class="repertoire-list-search__status"
                aria-live="polite"
              >
                Buscando...
              </span>
            </div>

            <button
              type="button"
              class="repertoire-list-filters-toggle"
              :class="{
                'repertoire-list-filters-toggle--expanded': filtersVisible,
                'repertoire-list-filters-toggle--applied': hasAdditionalFilters
              }"
              :aria-expanded="filtersVisible ? 'true' : 'false'"
              aria-controls="useful-link-group-advanced-filters"
              :disabled="listRefreshing"
              @click="toggleFiltersVisible"
            >
              <SlidersHorizontalIcon :size="16" aria-hidden="true" />
              Filtros
            </button>
          </div>

          <div
            v-show="filtersVisible"
            id="useful-link-group-advanced-filters"
            class="repertoire-list-advanced-filters"
          >
            <div class="repertoire-list-filter-group">
              <span class="repertoire-list-filter-group__label">Visibilidade</span>
              <div
                class="repertoire-list-filters"
                role="group"
                aria-label="Filtrar por visibilidade"
              >
                <button
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': visibilityFilter === null }"
                  :aria-pressed="visibilityFilter === null ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setVisibilityFilter(null)"
                >
                  Todas
                </button>
                <button
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': visibilityFilter === 'public' }"
                  :aria-pressed="visibilityFilter === 'public' ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setVisibilityFilter('public')"
                >
                  <GlobeIcon :size="16" aria-hidden="true" />
                  Pública
                </button>
                <button
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': visibilityFilter === 'private' }"
                  :aria-pressed="visibilityFilter === 'private' ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setVisibilityFilter('private')"
                >
                  <LockIcon :size="16" aria-hidden="true" />
                  Privada
                </button>
                <button
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': visibilityFilter === 'external' }"
                  :aria-pressed="visibilityFilter === 'external' ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setVisibilityFilter('external')"
                >
                  <Link2Icon :size="16" aria-hidden="true" />
                  Link externo
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="showEmptyState" class="description">
          Nenhuma pasta cadastrada.
        </p>
        <p v-else-if="showFilteredEmptyState" class="description">
          Nenhuma pasta encontrada para os filtros aplicados.
        </p>
        <div
          v-else
          class="repertoire-folder-grid"
          :class="{ 'repertoire-folder-grid--loading': listRefreshing }"
        >
          <AppTooltip
            v-for="item in items"
            :key="item.id"
            :text="shouldShowDescriptionTooltip(item) ? (item.description ?? '') : ''"
            position="top"
          >
            <RouterLink
              class="repertoire-folder-card repertoire-folder-card--link"
              :class="{
                'repertoire-folder-card--public': item.isPublic,
                'repertoire-folder-card--private': !item.isPublic
              }"
              :to="{ name: 'useful-link-groups-details', params: { id: item.id } }"
            >
              <div class="repertoire-folder-card__header">
                <span class="repertoire-folder-card__icon" aria-hidden="true">
                  <FolderIcon :size="28" />
                </span>
                <AppTooltip
                  :text="getVisibilityTooltip(item)"
                  position="top"
                >
                  <span
                    class="repertoire-folder-card__visibility"
                    :class="item.isPublic
                      ? 'repertoire-folder-card__visibility--public'
                      : 'repertoire-folder-card__visibility--private'"
                  >
                    <GlobeIcon
                      v-if="item.isPublic"
                      :size="12"
                      aria-hidden="true"
                    />
                    <LockIcon
                      v-else
                      :size="12"
                      aria-hidden="true"
                    />
                    {{ item.isPublic ? (item.allowPublicLinkAccess ? 'Link externo' : 'Pública') : 'Privada' }}
                  </span>
                </AppTooltip>
              </div>
              <div class="repertoire-folder-card__content">
                <h3 class="repertoire-folder-card__name">
                  {{ item.name }}
                </h3>
                <p
                  class="repertoire-folder-card__description"
                  :class="{ 'repertoire-folder-card__description--empty': !item.description }"
                >
                  {{ item.description || 'Sem descrição' }}
                </p>
              </div>
              <div class="repertoire-folder-card__actions">
                <AppTooltip
                  v-if="canCopyShareLink(item)"
                  text="Copiar link de compartilhamento"
                >
                  <button
                    type="button"
                    class="repertoire-folder-card__copy-link"
                    :disabled="actionLoadingId === item.id || listRefreshing"
                    aria-label="Copiar link de compartilhamento"
                    @click.prevent.stop="copyShareLink(item)"
                  >
                    <CopyIcon :size="14" aria-hidden="true" />
                    Copiar link
                  </button>
                </AppTooltip>
                <AppTooltip
                  v-if="canManageGroup(item)"
                  text="Excluir pasta"
                >
                  <button
                    type="button"
                    class="repertoire-folder-card__delete"
                    :disabled="actionLoadingId === item.id || listRefreshing"
                    aria-label="Excluir pasta"
                    @click.prevent.stop="handleDelete(item)"
                  >
                    <Trash2Icon :size="16" aria-hidden="true" />
                  </button>
                </AppTooltip>
              </div>
            </RouterLink>
          </AppTooltip>
        </div>

        <nav
          v-if="showPagination"
          class="repertoire-pagination"
          aria-label="Paginação de pastas de links"
        >
          <p class="repertoire-pagination__summary">
            Mostrando {{ pageRangeLabel }} de {{ totalItems }}
          </p>
          <div class="repertoire-pagination__controls">
            <button
              type="button"
              class="repertoire-pagination__button"
              :disabled="currentPage <= 1 || listRefreshing"
              aria-label="Página anterior"
              @click="goToPreviousPage"
            >
              <ChevronLeftIcon :size="16" aria-hidden="true" />
              Anterior
            </button>
            <span class="repertoire-pagination__page">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            <button
              type="button"
              class="repertoire-pagination__button"
              :disabled="currentPage >= totalPages || listRefreshing"
              aria-label="Próxima página"
              @click="goToNextPage"
            >
              Próxima
              <ChevronRightIcon :size="16" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </template>
    </section>
  </section>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  FolderIcon,
  GlobeIcon,
  Link2Icon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  UsersIcon
} from '@lucide/vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { RouterLink } from 'vue-router'
import { confirmDialogService } from '@/services/confirmDialogService'
import { promptUnsavedChanges } from '@/services/unsavedChangesPrompt'
import {
  buildPublicShareUrl,
  usefulLinkGroupService
} from '@/services/usefulLinkGroupService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import { unsavedChangesStore } from '@/stores/unsavedChangesStore'
import type {
  CreateUsefulLinkGroupRequest,
  UsefulLinkGroup,
  UsefulLinkGroupVisibilityFilter
} from '@/types/usefulLinkGroup'
import { Permissions } from '@/utils/permissions'

const USEFUL_LINK_GROUP_NAME_MAX_LENGTH = 120
const USEFUL_LINK_GROUP_DESCRIPTION_MAX_LENGTH = 2000
const DESCRIPTION_TOOLTIP_THRESHOLD = 72
const USEFUL_LINK_GROUP_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

type UsefulLinkGroupForm = {
  name: string
  description: string
  isPublic: boolean
  allowPublicLinkAccess: boolean
}

export default defineComponent({
  name: 'UsefulLinkGroupView',
  components: {
    AppTooltip,
    ArrowLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CopyIcon,
    FolderIcon,
    GlobeIcon,
    Link2Icon,
    LockIcon,
    PlusIcon,
    RouterLink,
    SearchIcon,
    SlidersHorizontalIcon,
    Trash2Icon,
    UsersIcon
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        isPublic: false,
        allowPublicLinkAccess: false
      } as UsefulLinkGroupForm,
      nameMaxLength: USEFUL_LINK_GROUP_NAME_MAX_LENGTH,
      descriptionMaxLength: USEFUL_LINK_GROUP_DESCRIPTION_MAX_LENGTH,
      items: [] as UsefulLinkGroup[],
      searchQuery: '',
      visibilityFilter: null as UsefulLinkGroupVisibilityFilter | null,
      filtersVisible: false,
      currentPage: 1,
      pageSize: USEFUL_LINK_GROUP_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasLoadedOnce: false,
      createFormVisible: false,
      loading: false,
      listLoading: false,
      listRefreshing: false,
      searchDebouncing: false,
      searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      actionLoadingId: null as number | null,
      nameError: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageAllGroups(): boolean {
      return this.authStore.hasPermission(Permissions.UsefulLinkGroupsManage)
    },
    canManageOwnGroups(): boolean {
      return this.authStore.hasPermission(Permissions.UsefulLinkGroupsManageOwn)
    },
    canCreateGroup(): boolean {
      return this.canManageAllGroups || this.canManageOwnGroups
    },
    nameFieldDescribedBy(): string {
      return this.nameError
        ? 'useful-link-group-name-counter useful-link-group-name-error'
        : 'useful-link-group-name-counter'
    },
    hasActiveFilters(): boolean {
      return this.searchQuery.trim().length > 0 || this.visibilityFilter !== null
    },
    hasAdditionalFilters(): boolean {
      return this.visibilityFilter !== null
    },
    isSearchPending(): boolean {
      return this.searchDebouncing || this.listRefreshing
    },
    showToolbar(): boolean {
      return this.hasLoadedOnce && (this.totalItems > 0 || this.hasActiveFilters)
    },
    showEmptyState(): boolean {
      return this.hasLoadedOnce && this.totalItems === 0 && !this.hasActiveFilters
    },
    showFilteredEmptyState(): boolean {
      return this.hasLoadedOnce && this.totalItems === 0 && this.hasActiveFilters
    },
    showPagination(): boolean {
      return this.totalPages > 1
    },
    listCountLabel(): string {
      if (this.listLoading) {
        return '—'
      }

      return String(this.totalItems)
    },
    pageRangeStart(): number {
      if (this.totalItems === 0) {
        return 0
      }

      return (this.currentPage - 1) * this.pageSize + 1
    },
    pageRangeEnd(): number {
      if (this.totalItems === 0) {
        return 0
      }

      return Math.min(this.currentPage * this.pageSize, this.totalItems)
    },
    pageRangeLabel(): string {
      if (this.totalItems === 0) {
        return '0'
      }

      return `${this.pageRangeStart}–${this.pageRangeEnd}`
    }
  },
  watch: {
    searchQuery(): void {
      this.scheduleSearch()
    }
  },
  mounted() {
    void this.loadItems()
  },
  beforeUnmount() {
    this.clearSearchDebounce()
  },
  methods: {
    shouldShowDescriptionTooltip(item: UsefulLinkGroup): boolean {
      return Boolean(item.description && item.description.length > DESCRIPTION_TOOLTIP_THRESHOLD)
    },
    getVisibilityTooltip(item: UsefulLinkGroup): string {
      if (!item.isPublic) {
        return 'Apenas você pode ver esta pasta.'
      }
      if (item.allowPublicLinkAccess) {
        return 'Qualquer pessoa com o link pode acessar, sem precisar entrar no sistema.'
      }
      return 'Visível para todos os usuários logados no Bless App.'
    },
    canManageGroup(item: UsefulLinkGroup): boolean {
      return this.canManageAllGroups
        || (this.canManageOwnGroups && item.isOwnedByCurrentUser)
    },
    canCopyShareLink(item: UsefulLinkGroup): boolean {
      return Boolean(
        this.canManageGroup(item)
        && item.isPublic
        && item.allowPublicLinkAccess
      )
    },
    async copyShareLink(item: UsefulLinkGroup): Promise<void> {
      if (!this.canCopyShareLink(item)) {
        return
      }

      this.actionLoadingId = item.id

      try {
        let shareHash = item.publicShareHash

        if (!shareHash) {
          const response = await usefulLinkGroupService.generateShareLink(item.id)
          shareHash = response.payload?.shareHash ?? null

          if (shareHash) {
            item.hasPublicShareLink = true
            item.publicShareHash = shareHash
          }
        }

        if (!shareHash) {
          throw new Error('Não foi possível obter o link de compartilhamento.')
        }

        await navigator.clipboard.writeText(buildPublicShareUrl(shareHash))
        toastService.success('Link copiado para a área de transferência.')
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Não foi possível copiar o link.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },
    async handleDelete(item: UsefulLinkGroup): Promise<void> {
      if (!this.canManageGroup(item)) {
        return
      }
      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir pasta',
        message: `Deseja excluir a pasta "${item.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })
      if (!confirmed) {
        return
      }
      this.actionLoadingId = item.id
      try {
        const response = await usefulLinkGroupService.remove(item.id)
        toastService.success(response.message)

        if (this.items.length === 1 && this.currentPage > 1) {
          this.currentPage -= 1
        }

        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir a pasta.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },
    async loadItems(): Promise<void> {
      if (!this.hasLoadedOnce) {
        this.listLoading = true
      } else {
        this.listRefreshing = true
      }

      try {
        const response = await usefulLinkGroupService.list({
          search: this.searchQuery,
          visibility: this.visibilityFilter,
          page: this.currentPage,
          pageSize: this.pageSize
        })
        const paged = response.payload

        if (paged) {
          this.items = paged.items ?? []
          this.currentPage = paged.page
          this.totalItems = paged.totalItems
          this.totalPages = paged.totalPages
        }
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar as pastas.'
        )
      } finally {
        this.listLoading = false
        this.listRefreshing = false
        this.searchDebouncing = false
        this.hasLoadedOnce = true
      }
    },
    setVisibilityFilter(value: UsefulLinkGroupVisibilityFilter | null): void {
      if (this.visibilityFilter === value) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.visibilityFilter = value
      this.currentPage = 1
      void this.loadItems()
    },
    toggleFiltersVisible(): void {
      this.filtersVisible = !this.filtersVisible
    },
    scheduleSearch(): void {
      this.clearSearchDebounce()
      this.searchDebouncing = true

      this.searchDebounceTimer = setTimeout(() => {
        this.searchDebounceTimer = null
        this.currentPage = 1
        void this.loadItems()
      }, SEARCH_DEBOUNCE_MS)
    },
    clearSearchDebounce(): void {
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
        this.searchDebounceTimer = null
      }
    },
    goToPreviousPage(): void {
      if (this.currentPage <= 1 || this.listRefreshing) {
        return
      }

      this.currentPage -= 1
      void this.loadItems()
    },
    goToNextPage(): void {
      if (this.currentPage >= this.totalPages || this.listRefreshing) {
        return
      }

      this.currentPage += 1
      void this.loadItems()
    },
    async handleSubmit(): Promise<void> {
      const trimmedName = this.form.name.trim()
      if (!trimmedName) {
        this.nameError = 'O nome é obrigatório.'
        return
      }
      this.loading = true
      const payload: CreateUsefulLinkGroupRequest = {
        name: trimmedName,
        description: this.form.description.trim() || null,
        isPublic: this.form.isPublic,
        allowPublicLinkAccess: this.form.allowPublicLinkAccess
      }
      try {
        const response = await usefulLinkGroupService.create(payload)
        toastService.success(response.message)
        this.closeCreateForm()
        this.currentPage = 1
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao cadastrar a pasta.'
        )
      } finally {
        this.loading = false
      }
    },
    clearNameError(): void {
      if (this.nameError) {
        this.nameError = ''
      }
    },
    resetForm(): void {
      this.form = {
        name: '',
        description: '',
        isPublic: false,
        allowPublicLinkAccess: false
      }
      this.nameError = ''
    },
    selectPrivateVisibility(): void {
      this.form.isPublic = false
      this.form.allowPublicLinkAccess = false
    },
    selectPublicVisibility(): void {
      this.form.isPublic = true
    },
    openCreateForm(): void {
      this.resetForm()
      this.createFormVisible = true
    },
    async requestCloseCreateForm(): Promise<void> {
      const form = this.$refs.createForm as HTMLFormElement | undefined
      const dirtySources = form ? unsavedChangesStore.getDirtySources(form) : []

      if (dirtySources.length === 0) {
        this.closeCreateForm()
        return
      }

      const choice = await promptUnsavedChanges()

      if (choice === 'confirm') {
        await unsavedChangesStore.save(dirtySources)
        return
      }

      if (choice === 'secondary') {
        unsavedChangesStore.discard(dirtySources)
        this.closeCreateForm()
      }
    },
    closeCreateForm(): void {
      this.createFormVisible = false
      this.resetForm()
    }
  }
})
</script>


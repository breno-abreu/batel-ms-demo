<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <Link2Icon :size="20" />
          </span>
          <h1>{{ pageTitle }}</h1>
        </div>
        <p class="description repertoire-page__header-description">
          {{ isCreateMode
            ? 'Cadastre um novo link útil para a equipe.'
            : 'Edite os detalhes do link selecionado.' }}
        </p>
      </div>

      <RouterLink
        class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
        :to="{ name: 'useful-link-list' }"
      >
        <ArrowLeftIcon :size="16" aria-hidden="true" />
        Voltar para a lista
      </RouterLink>
    </header>

    <div
      v-if="pageLoading"
      class="repertoire-details-form repertoire-details-form--skeleton"
      aria-hidden="true"
    >
      <section
        v-for="sectionIndex in 2"
        :key="sectionIndex"
        class="repertoire-card"
      >
        <span class="app-skeleton app-skeleton--title" />
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
      </section>
    </div>

    <form v-unsaved-changes
      v-else
      class="repertoire-details-form"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <section class="repertoire-card">
        <h2>Dados do link</h2>

        <div class="repertoire-form repertoire-form--grid">
          <label class="repertoire-form__field--full">
            Nome *
            <input
              id="useful-link-name"
              v-model="form.name"
              type="text"
              class="field-control"
              :maxlength="nameMaxLength"
              placeholder="Ex.: Manual de escala"
              :class="{ 'field-control--invalid': nameError }"
              :aria-invalid="nameError ? 'true' : 'false'"
              @input="clearNameError"
            >
            <span
              id="useful-link-name-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.name.length }}/{{ nameMaxLength }}
            </span>
            <span
              v-if="nameError"
              id="useful-link-name-error"
              class="field-error"
              role="alert"
            >
              {{ nameError }}
            </span>
          </label>

          <label>
            Tipo *
            <select
              id="useful-link-type"
              v-model="form.usefulLinkTypeId"
              class="field-control"
              :class="{ 'field-control--invalid': typeError }"
              :aria-invalid="typeError ? 'true' : 'false'"
              @change="clearTypeError"
            >
              <option :value="null">
                Selecione um tipo
              </option>
              <option
                v-for="type in selectableTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.name }}
              </option>
            </select>
            <span
              class="field-counter field-counter--reserve"
              aria-hidden="true"
            >
              &nbsp;
            </span>
            <span
              v-if="typeError"
              id="useful-link-type-error"
              class="field-error"
              role="alert"
            >
              {{ typeError }}
            </span>
          </label>

          <label>
            URL *
            <input
              id="useful-link-url"
              v-model="form.url"
              type="text"
              class="field-control"
              :maxlength="urlMaxLength"
              :placeholder="urlPlaceholder"
              :class="{ 'field-control--invalid': urlError }"
              :aria-invalid="urlError ? 'true' : 'false'"
              @input="clearUrlError"
            >
            <span
              id="useful-link-url-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.url.length }}/{{ urlMaxLength }}
            </span>
            <span
              v-if="urlError"
              id="useful-link-url-error"
              class="field-error"
              role="alert"
            >
              {{ urlError }}
            </span>
          </label>

          <label class="repertoire-form__field--full">
            Observações
            <textarea
              id="useful-link-notes"
              v-model="form.notes"
              class="field-control"
              rows="4"
              placeholder="Informações adicionais sobre o link (opcional)"
            />
          </label>
        </div>
      </section>

      <div v-if="canManageLinks" class="repertoire-details-form__actions">
        <RouterLink
          class="field-button field-button--ghost"
          :to="{ name: 'useful-link-list' }"
        >
          Cancelar
        </RouterLink>
        <button type="submit" class="repertoire-button" :disabled="loading">
          {{ loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeftIcon, Link2Icon } from '@lucide/vue'
import { usefulLinkService } from '@/services/usefulLinkService'
import { usefulLinkTypeService } from '@/services/usefulLinkTypeService'
import { toastService } from '@/services/toastService'
import type { SaveUsefulLinkRequest, UsefulLinkType } from '@/types/usefulLinks'
import { isValidOptionalUrl, normalizeOptionalUrl } from '@/utils/urlUtils'

const NAME_MAX_LENGTH = 120
const URL_MAX_LENGTH = 1000

type UsefulLinkForm = {
  name: string
  usefulLinkTypeId: number | null
  url: string
  notes: string
}

function createEmptyForm(): UsefulLinkForm {
  return {
    name: '',
    usefulLinkTypeId: null,
    url: '',
    notes: ''
  }
}

export default defineComponent({
  name: 'UsefulLinkDetailsView',
  components: {
    ArrowLeftIcon,
    Link2Icon,
    RouterLink
  },
  data() {
    return {
      form: createEmptyForm(),
      usefulLinkTypes: [] as UsefulLinkType[],
      nameMaxLength: NAME_MAX_LENGTH,
      urlMaxLength: URL_MAX_LENGTH,
      urlPlaceholder: 'exemplo.com/recurso',
      nameError: '',
      typeError: '',
      urlError: '',
      pageLoading: false,
      loading: false
    }
  },
  computed: {
    canManageLinks(): boolean {
      return true
    },
    isCreateMode(): boolean {
      return this.$route.params.id === 'new'
    },
    usefulLinkId(): number | null {
      if (this.isCreateMode) {
        return null
      }

      const parsedId = Number(this.$route.params.id)
      return Number.isNaN(parsedId) ? null : parsedId
    },
    pageTitle(): string {
      return this.isCreateMode ? 'Novo link útil' : 'Editar link útil'
    },
    selectableTypes(): UsefulLinkType[] {
      return this.usefulLinkTypes
    }
  },
  watch: {
    '$route.params.id'() {
      void this.initializePage()
    }
  },
  mounted() {
    void this.initializePage()
  },
  methods: {
    async initializePage(): Promise<void> {
      this.pageLoading = true
      this.nameError = ''
      this.typeError = ''
      this.urlError = ''

      try {
        await this.loadLookups()

        if (!this.isCreateMode) {
          if (this.usefulLinkId === null) {
            throw new Error('Identificador do link inválido.')
          }

          await this.loadDetails(this.usefulLinkId)
        } else {
          this.form = createEmptyForm()
        }
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar a página.'
        )
      } finally {
        this.pageLoading = false
      }
    },

    async loadLookups(): Promise<void> {
      const response = await usefulLinkTypeService.list()
      this.usefulLinkTypes = response.payload ?? []
    },

    async loadDetails(id: number): Promise<void> {
      const response = await usefulLinkService.getById(id)
      const details = response.payload

      if (!details) {
        throw new Error('Link útil não encontrado.')
      }

      this.form = {
        name: details.name,
        usefulLinkTypeId: details.usefulLinkTypeId,
        url: details.url,
        notes: details.notes ?? ''
      }
    },

    clearNameError(): void {
      this.nameError = ''
    },

    clearTypeError(): void {
      this.typeError = ''
    },

    clearUrlError(): void {
      this.urlError = ''
    },

    validateForm(): boolean {
      this.nameError = ''
      this.typeError = ''
      this.urlError = ''

      const trimmedName = this.form.name.trim()

      if (!trimmedName) {
        this.nameError = 'O nome é obrigatório.'
      } else if (trimmedName.length > NAME_MAX_LENGTH) {
        this.nameError = `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`
      }

      if (this.form.usefulLinkTypeId === null) {
        this.typeError = 'O tipo é obrigatório.'
      }

      const trimmedUrl = this.form.url.trim()

      if (!trimmedUrl) {
        this.urlError = 'A URL é obrigatória.'
      } else if (!isValidOptionalUrl(trimmedUrl)) {
        this.urlError = 'Informe uma URL válida.'
      }

      return !this.nameError && !this.typeError && !this.urlError
    },

    buildPayload(): SaveUsefulLinkRequest {
      const normalizedUrl = normalizeOptionalUrl(this.form.url)

      return {
        name: this.form.name.trim(),
        usefulLinkTypeId: this.form.usefulLinkTypeId as number,
        url: normalizedUrl ?? this.form.url.trim(),
        notes: this.form.notes.trim() || null
      }
    },

    async handleSubmit(): Promise<void> {
      if (!this.canManageLinks || !this.validateForm()) {
        return
      }

      this.loading = true
      const payload = this.buildPayload()

      try {
        if (this.isCreateMode) {
          const response = await usefulLinkService.create(payload)
          toastService.success(response.message)

          if (response.payload?.id) {
            await this.$router.push({
              name: 'useful-link-details',
              params: { id: String(response.payload.id) }
            })
          }

          return
        }

        if (this.usefulLinkId === null) {
          throw new Error('Identificador do link inválido.')
        }

        const response = await usefulLinkService.update(this.usefulLinkId, payload)
        toastService.success(response.message)
        await this.loadDetails(this.usefulLinkId)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao salvar o link útil.'
        )
      } finally {
        this.loading = false
      }
    }
  }
})
</script>

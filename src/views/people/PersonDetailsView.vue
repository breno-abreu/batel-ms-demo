<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <UsersIcon :size="20" />
          </span>
          <h1>{{ pageTitle }}</h1>
        </div>
        <p class="description repertoire-page__header-description">
          {{ headerDescription }}
        </p>
      </div>

      <RouterLink
        class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
        :to="backRoute"
      >
        <ArrowLeftIcon :size="16" aria-hidden="true" />
        {{ backLabel }}
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
        <div class="repertoire-card__title-row">
          <h2>Informações gerais</h2>
          <span
            v-if="!isCreateMode && !isSelfProfile"
            class="repertoire-status"
            :class="{ 'repertoire-status--inactive': !details?.isActive }"
          >
            {{ details?.isActive ? 'Ativo' : 'Inativo' }}
          </span>
        </div>

        <div class="repertoire-form repertoire-form--grid person-details-form__grid">
          <label class="repertoire-form__field--full">
            Nome completo *
            <input
              id="person-full-name"
              v-model="form.fullName"
              type="text"
              class="field-control"
              :maxlength="fullNameMaxLength"
              placeholder="Ex.: Maria Silva"
              :disabled="!canEdit"
              :class="{ 'field-control--invalid': fullNameError }"
              :aria-invalid="fullNameError ? 'true' : 'false'"
              @input="clearFullNameError"
            >
            <span class="field-counter" aria-live="polite">
              {{ form.fullName.length }}/{{ fullNameMaxLength }}
            </span>
            <span
              v-if="fullNameError"
              class="field-error"
              role="alert"
            >
              {{ fullNameError }}
            </span>
          </label>

          <label>
            Nome preferido
            <input
              id="person-preferred-name"
              v-model="form.preferredName"
              type="text"
              class="field-control"
              :maxlength="preferredNameMaxLength"
              placeholder="Ex.: Maria"
              :disabled="!canEdit"
            >
            <span class="field-counter" aria-live="polite">
              {{ form.preferredName.length }}/{{ preferredNameMaxLength }}
            </span>
          </label>

          <label>
            Data de nascimento
            <input
              id="person-birth-date"
              v-model="form.birthDate"
              type="date"
              class="field-control"
              :disabled="!canEdit"
            >
            <span class="field-counter field-counter--reserve" aria-hidden="true">
              &nbsp;
            </span>
          </label>

          <label>
            E-mail
            <AppTooltip
              v-if="isEmailLocked"
              class="person-details-form__locked-field"
              :text="emailLockTooltip"
            >
              <input
                id="person-email"
                v-model="form.email"
                type="email"
                class="field-control"
                maxlength="254"
                placeholder="exemplo@email.com"
                disabled
                readonly
                tabindex="-1"
                aria-disabled="true"
              >
            </AppTooltip>
            <input
              v-else
              id="person-email"
              v-model="form.email"
              type="email"
              class="field-control"
              :class="{ 'field-control--invalid': emailError }"
              maxlength="254"
              placeholder="exemplo@email.com"
              :disabled="!canEdit"
              :aria-invalid="emailError ? 'true' : 'false'"
              @input="handleEmailInput"
            >
            <span
              v-if="emailError"
              class="field-error"
              role="alert"
            >
              {{ emailError }}
            </span>
            <span
              v-else
              class="field-counter field-counter--reserve"
              aria-hidden="true"
            >
              &nbsp;
            </span>
          </label>

          <label>
            Celular
            <input
              id="person-mobile-phone"
              :value="form.mobilePhone"
              type="tel"
              class="field-control"
              :class="{ 'field-control--invalid': mobilePhoneError }"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="Ex.: (11) 99999-9999"
              :disabled="!canEdit"
              :aria-invalid="mobilePhoneError ? 'true' : 'false'"
              @input="handleMobilePhoneInput"
            >
            <span v-if="mobilePhoneError" class="field-error" role="alert">
              {{ mobilePhoneError }}
            </span>
          </label>

          <label class="repertoire-form__field--full">
            Observações
            <textarea
              id="person-notes"
              v-model="form.notes"
              rows="4"
              class="field-control"
              :maxlength="notesMaxLength"
              placeholder="Informações adicionais sobre a pessoa"
              :disabled="!canEdit"
            />
            <span class="field-counter" aria-live="polite">
              {{ form.notes.length }}/{{ notesMaxLength }}
            </span>
          </label>
        </div>
      </section>

      <section
        v-if="canEdit || (details && !isCreateMode)"
        class="repertoire-card"
      >
        <h2>Atribuições</h2>

        <div class="repertoire-form repertoire-form--grid">
          <div class="repertoire-form__field--full person-assignment-picker">
            <div class="repertoire-theme-picker__header">
              <span class="repertoire-theme-picker__label">
                Ministérios
                <span
                  v-if="canEdit"
                  class="repertoire-theme-picker__hint"
                >
                  (Selecione um ou mais ministérios)
                </span>
              </span>
            </div>

            <p v-if="canEdit && availableMinistries.length === 0" class="description">
              Nenhum ministério ativo cadastrado.
            </p>

            <div
              v-else-if="canEdit"
              class="repertoire-theme-picker__options"
              role="group"
              aria-label="Selecionar ministérios"
            >
              <button
                v-for="ministry in availableMinistries"
                :key="ministry.id"
                type="button"
                data-unsaved-change
                class="repertoire-theme-picker__option"
                :class="{
                  'repertoire-theme-picker__option--selected': isMinistrySelected(ministry.id),
                  'repertoire-theme-picker__option--animating': animatedMinistryId === ministry.id
                }"
                :aria-pressed="isMinistrySelected(ministry.id) ? 'true' : 'false'"
                @click="toggleMinistry(ministry.id)"
                @animationend="clearMinistryAnimation(ministry.id, $event)"
              >
                <ChurchIcon :size="14" aria-hidden="true" />
                {{ ministry.name }}
              </button>
            </div>

            <template v-else-if="details">
              <p v-if="details.ministries.length === 0" class="description">
                Nenhum ministério vinculado.
              </p>
              <div
                v-else
                class="people-assignment-list"
                role="list"
              >
                <span
                  v-for="ministry in details.ministries"
                  :key="`ministry-${ministry.id}`"
                  class="repertoire-badge"
                  role="listitem"
                >
                  {{ ministry.name }}
                </span>
              </div>
            </template>
          </div>

          <div class="repertoire-form__field--full person-assignment-picker">
            <div class="repertoire-theme-picker__header">
              <span class="repertoire-theme-picker__label">
                Habilidades
                <span
                  v-if="canEdit"
                  class="repertoire-theme-picker__hint"
                >
                  (Selecione uma ou mais habilidades)
                </span>
              </span>
            </div>

            <p v-if="canEdit && availableSkills.length === 0" class="description">
              Nenhuma habilidade ativa cadastrada.
            </p>

            <div
              v-else-if="canEdit"
              class="repertoire-theme-picker__options"
              role="group"
              aria-label="Selecionar habilidades"
            >
              <button
                v-for="skill in availableSkills"
                :key="skill.id"
                type="button"
                data-unsaved-change
                class="repertoire-theme-picker__option"
                :class="{
                  'repertoire-theme-picker__option--selected': isSkillSelected(skill.id),
                  'repertoire-theme-picker__option--animating': animatedSkillId === skill.id
                }"
                :aria-pressed="isSkillSelected(skill.id) ? 'true' : 'false'"
                @click="toggleSkill(skill.id)"
                @animationend="clearSkillAnimation(skill.id, $event)"
              >
                <AwardIcon :size="14" aria-hidden="true" />
                {{ skill.name }}
              </button>
            </div>

            <template v-else-if="details">
              <p v-if="details.skills.length === 0" class="description">
                Nenhuma habilidade vinculada.
              </p>
              <div
                v-else
                class="people-assignment-list"
                role="list"
              >
                <span
                  v-for="skill in details.skills"
                  :key="`skill-${skill.id}`"
                  class="repertoire-badge"
                  role="listitem"
                >
                  {{ skill.name }}
                </span>
              </div>
            </template>
          </div>

          <div
            v-if="details && details.managedMinistries.length > 0"
            class="repertoire-form__field--full person-assignment-picker"
          >
            <span class="repertoire-theme-picker__label">Responsável por</span>
            <div
              class="people-assignment-list"
              role="list"
            >
              <span
                v-for="ministry in details.managedMinistries"
                :key="`managed-${ministry.id}`"
                class="repertoire-badge"
                role="listitem"
              >
                {{ ministry.name }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div
        v-if="canEdit"
        class="repertoire-details-form__actions"
      >
        <RouterLink
          class="field-button field-button--ghost"
          :to="backRoute"
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
import {
  ArrowLeftIcon,
  AwardIcon,
  ChurchIcon,
  UsersIcon
} from '@lucide/vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { ministryService } from '@/services/ministryService'
import { personService } from '@/services/personService'
import { skillService } from '@/services/skillService'
import { toastService } from '@/services/toastService'
import type {
  CreatePersonRequest,
  Ministry,
  PersonDetails,
  Skill,
  UpdateSelfPersonRequest
} from '@/types/people'
import {
  formatBrazilianMobilePhone,
  isValidBrazilianMobilePhone,
  normalizePhoneDigits
} from '@/utils/phone'
import { isValidEmail, normalizeEmail } from '@/utils/email'

const FULL_NAME_MAX_LENGTH = 100
const PREFERRED_NAME_MAX_LENGTH = 100
const NOTES_MAX_LENGTH = 500
const EMAIL_AVAILABILITY_DEBOUNCE_MS = 400

type PersonForm = {
  fullName: string
  preferredName: string
  birthDate: string
  email: string
  mobilePhone: string
  notes: string
  ministryIds: number[]
  skillIds: number[]
}

function createEmptyForm(): PersonForm {
  return {
    fullName: '',
    preferredName: '',
    birthDate: '',
    email: '',
    mobilePhone: '',
    notes: '',
    ministryIds: [],
    skillIds: []
  }
}

export default defineComponent({
  name: 'PersonDetailsView',
  components: {
    AppTooltip,
    ArrowLeftIcon,
    AwardIcon,
    ChurchIcon,
    RouterLink,
    UsersIcon
  },
  data() {
    return {
      form: createEmptyForm(),
      details: null as PersonDetails | null,
      availableMinistries: [] as Ministry[],
      availableSkills: [] as Skill[],
      fullNameMaxLength: FULL_NAME_MAX_LENGTH,
      preferredNameMaxLength: PREFERRED_NAME_MAX_LENGTH,
      notesMaxLength: NOTES_MAX_LENGTH,
      fullNameError: '',
      mobilePhoneError: '',
      emailError: '',
      emailAvailabilityRequestId: 0,
      emailAvailabilityTimeoutId: null as number | null,
      pageLoading: false,
      loading: false,
      animatedMinistryId: null as number | null,
      animatedSkillId: null as number | null
    }
  },
  computed: {
    canManagePeople(): boolean {
      return true
    },
    isSelfProfile(): boolean {
      return this.$route.meta.selfProfile === true
    },
    isEmailLocked(): boolean {
      return this.isSelfProfile
    },
    emailLockTooltip(): string {
      return 'Não é possível alterar o e-mail.'
    },
    canEdit(): boolean {
      return this.canManagePeople || this.isSelfProfile
    },
    backRoute(): { name: string } {
      return this.isSelfProfile
        ? { name: 'home' }
        : { name: 'people-list' }
    },
    backLabel(): string {
      return this.isSelfProfile ? 'Voltar ao início' : 'Voltar para a lista'
    },
    isCreateMode(): boolean {
      return this.$route.params.id === 'new'
    },
    personId(): number | null {
      if (this.isCreateMode) {
        return null
      }

      const parsedId = Number(this.$route.params.id)
      return Number.isNaN(parsedId) ? null : parsedId
    },
    pageTitle(): string {
      if (this.isSelfProfile) {
        return 'Meus dados'
      }

      if (this.isCreateMode) {
        return 'Nova pessoa'
      }

      if (this.details?.preferredName) {
        return this.details.preferredName
      }

      return this.details?.fullName ?? 'Detalhes da pessoa'
    },
    headerDescription(): string {
      if (this.isSelfProfile) {
        return 'Atualize seus dados gerais, ministérios e habilidades.'
      }

      if (this.canEdit && this.isCreateMode) {
        return 'Cadastre uma nova pessoa e defina ministérios e habilidades.'
      }

      if (this.canEdit) {
        return 'Edite os dados, ministérios e habilidades da pessoa selecionada.'
      }

      return 'Consulte os dados e atribuições da pessoa selecionada.'
    }
  },
  watch: {
    '$route.fullPath'() {
      void this.initializePage()
    }
  },
  mounted() {
    void this.initializePage()
  },
  beforeUnmount() {
    this.clearEmailAvailabilityTimeout()
  },
  methods: {
    async initializePage(): Promise<void> {
      if (this.isCreateMode && !this.canManagePeople) {
        toastService.error('Acesso restrito a quem pode gerenciar pessoas.')
        await this.$router.replace({ name: 'people-list' })
        return
      }

      this.pageLoading = true
      this.fullNameError = ''
      this.emailError = ''
      this.clearEmailAvailabilityTimeout()
      this.details = null

      try {
        if (this.isSelfProfile) {
          await this.loadLookups()
          await this.loadSelfProfile()
          return
        }

        if (this.canManagePeople) {
          await this.loadLookups()
        }

        if (this.isCreateMode) {
          this.form = createEmptyForm()
          return
        }

        if (this.personId === null) {
          throw new Error('Identificador da pessoa inválido.')
        }

        await this.loadDetails(this.personId)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar a página.'
        )
      } finally {
        this.pageLoading = false
      }
    },

    async loadLookups(): Promise<void> {
      await this.loadMinistriesAndSkills()
    },

    async loadMinistriesAndSkills(): Promise<void> {
      const [ministriesResponse, skillsResponse] = await Promise.all([
        ministryService.list(),
        skillService.list()
      ])

      this.availableMinistries = (ministriesResponse.payload ?? []).filter((item) => item.isActive)
      this.availableSkills = skillsResponse.payload ?? []
    },

    async loadSelfProfile(): Promise<void> {
      const response = await personService.getMe()
      const details = response.payload

      if (!details) {
        throw new Error('Não foi possível carregar seus dados.')
      }

      this.applyDetails(details)
    },

    applyDetails(details: PersonDetails): void {
      this.details = details
      this.form = {
        fullName: details.fullName,
        preferredName: details.preferredName ?? '',
        birthDate: details.birthDate ?? '',
        email: details.email ?? '',
        mobilePhone: formatBrazilianMobilePhone(details.mobilePhone),
        notes: details.notes ?? '',
        ministryIds: details.ministries.map((ministry) => ministry.id),
        skillIds: details.skills.map((skill) => skill.id)
      }
    },

    async loadDetails(id: number): Promise<void> {
      const response = await personService.getById(id)
      const details = response.payload

      if (!details) {
        throw new Error('Pessoa não encontrada.')
      }

      this.applyDetails(details)
    },

    isMinistrySelected(ministryId: number): boolean {
      return this.form.ministryIds.includes(ministryId)
    },

    isSkillSelected(skillId: number): boolean {
      return this.form.skillIds.includes(skillId)
    },

    toggleMinistry(ministryId: number): void {
      this.animatedMinistryId = ministryId

      if (this.isMinistrySelected(ministryId)) {
        this.form.ministryIds = this.form.ministryIds.filter((id) => id !== ministryId)
        return
      }

      if (this.details && !this.details.isActive) {
        toastService.warning(
          'Não é possível associar ministérios a uma pessoa desativada.'
        )
        return
      }

      this.form.ministryIds = [...this.form.ministryIds, ministryId]
    },

    toggleSkill(skillId: number): void {
      this.animatedSkillId = skillId

      if (this.isSkillSelected(skillId)) {
        this.form.skillIds = this.form.skillIds.filter((id) => id !== skillId)
        return
      }

      if (this.details && !this.details.isActive) {
        toastService.warning(
          'Não é possível associar habilidades a uma pessoa desativada.'
        )
        return
      }

      this.form.skillIds = [...this.form.skillIds, skillId]
    },

    clearMinistryAnimation(ministryId: number, event: AnimationEvent): void {
      if (event.target !== event.currentTarget) {
        return
      }

      if (this.animatedMinistryId === ministryId) {
        this.animatedMinistryId = null
      }
    },

    clearSkillAnimation(skillId: number, event: AnimationEvent): void {
      if (event.target !== event.currentTarget) {
        return
      }

      if (this.animatedSkillId === skillId) {
        this.animatedSkillId = null
      }
    },

    clearFullNameError(): void {
      this.fullNameError = ''
    },

    handleMobilePhoneInput(event: Event): void {
      const input = event.target as HTMLInputElement
      const formattedValue = formatBrazilianMobilePhone(input.value)

      this.form.mobilePhone = formattedValue
      input.value = formattedValue
      this.mobilePhoneError = ''
    },

    clearEmailAvailabilityTimeout(): void {
      if (this.emailAvailabilityTimeoutId !== null) {
        window.clearTimeout(this.emailAvailabilityTimeoutId)
        this.emailAvailabilityTimeoutId = null
      }
    },

    handleEmailInput(): void {
      if (this.isEmailLocked) {
        return
      }

      const trimmedEmail = this.form.email.trim()
      this.clearEmailAvailabilityTimeout()

      if (!trimmedEmail) {
        this.emailError = ''
        return
      }

      if (!isValidEmail(trimmedEmail)) {
        this.emailError = 'Informe um e-mail válido.'
        return
      }

      this.emailError = ''
      const requestId = this.emailAvailabilityRequestId + 1
      this.emailAvailabilityRequestId = requestId

      this.emailAvailabilityTimeoutId = window.setTimeout(() => {
        void this.checkEmailAvailability(requestId)
      }, EMAIL_AVAILABILITY_DEBOUNCE_MS)
    },

    async checkEmailAvailability(requestId: number): Promise<void> {
      const trimmedEmail = this.form.email.trim()

      if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
        return
      }

      try {
        const response = await personService.checkEmailAvailability(
          normalizeEmail(trimmedEmail),
          this.isCreateMode ? null : this.details?.id
        )
        const availability = response.payload

        if (requestId !== this.emailAvailabilityRequestId) {
          return
        }

        if (availability && !availability.isAvailable) {
          this.emailError = availability.reason || 'Este e-mail já está cadastrado no sistema.'
          return
        }

        this.emailError = ''
      } catch {
        if (requestId !== this.emailAvailabilityRequestId) {
          return
        }

        this.emailError = ''
      }
    },

    validateForm(): boolean {
      this.fullNameError = ''
      this.mobilePhoneError = ''

      const trimmedName = this.form.fullName.trim()

      if (!trimmedName) {
        this.fullNameError = 'O nome completo é obrigatório.'
      } else if (trimmedName.length > FULL_NAME_MAX_LENGTH) {
        this.fullNameError = `O nome completo deve ter no máximo ${FULL_NAME_MAX_LENGTH} caracteres.`
      }

      if (!this.isEmailLocked) {
        const trimmedEmail = this.form.email.trim()

        if (trimmedEmail && !isValidEmail(trimmedEmail)) {
          this.emailError = 'Informe um e-mail válido.'
        }
      }

      if (this.form.mobilePhone && !isValidBrazilianMobilePhone(this.form.mobilePhone)) {
        this.mobilePhoneError =
          'Informe um celular válido com DDD e número começando com 9. Ex.: (41) 99999-9999.'
      }

      return !this.fullNameError && !this.mobilePhoneError && !this.emailError
    },

    buildSelfSavePayload(): UpdateSelfPersonRequest {
      return {
        fullName: this.form.fullName.trim(),
        preferredName: this.form.preferredName.trim() || null,
        birthDate: this.form.birthDate || null,
        mobilePhone: normalizePhoneDigits(this.form.mobilePhone) || null,
        notes: this.form.notes.trim() || null,
        ministryIds: [...this.form.ministryIds],
        skillIds: [...this.form.skillIds]
      }
    },

    buildSavePayload(): CreatePersonRequest {
      return {
        fullName: this.form.fullName.trim(),
        preferredName: this.form.preferredName.trim() || null,
        birthDate: this.form.birthDate || null,
        email: this.form.email.trim() || null,
        mobilePhone: normalizePhoneDigits(this.form.mobilePhone) || null,
        notes: this.form.notes.trim() || null,
        ministryIds: [...this.form.ministryIds],
        skillIds: [...this.form.skillIds]
      }
    },

    async handleSubmit(): Promise<void> {
      if (!this.canEdit || !this.validateForm()) {
        return
      }

      this.loading = true

      try {
        if (this.isSelfProfile) {
          const response = await personService.updateMe(this.buildSelfSavePayload())
          toastService.success(response.message)
          await this.loadSelfProfile()
          return
        }

        const payload = this.buildSavePayload()

        if (this.isCreateMode) {
          const response = await personService.create(payload)
          toastService.success(response.message)

          if (response.payload?.id) {
            await this.$router.push({
              name: 'people-details',
              params: { id: String(response.payload.id) }
            })
          }

          return
        }

        if (this.personId === null) {
          throw new Error('Identificador da pessoa inválido.')
        }

        const response = await personService.update(this.personId, payload)
        toastService.success(response.message)
        await this.loadDetails(this.personId)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao salvar a pessoa.'
        )
      } finally {
        this.loading = false
      }
    }
  }
})
</script>

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
        v-for="sectionIndex in 3"
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

      <section
        v-if="showSystemAccessSection"
        class="repertoire-card"
      >
        <h2>Acesso ao sistema</h2>

        <div class="repertoire-form repertoire-form--grid person-details-form__grid">
          <template v-if="canEditSystemAccess">
            <div class="repertoire-form__field--full">
              <div
                class="repertoire-folder-visibility__options person-system-access__options"
                role="group"
                aria-label="Configurações de acesso ao sistema"
              >
                <button
                  type="button"
                  data-unsaved-change
                  class="repertoire-folder-visibility__option"
                  :class="{ 'repertoire-folder-visibility__option--selected': form.hasSystemAccess }"
                  :aria-pressed="form.hasSystemAccess ? 'true' : 'false'"
                  @click="toggleSystemAccess"
                >
                  <component
                    :is="form.hasSystemAccess ? 'LogInIcon' : 'LockIcon'"
                    :size="22"
                    aria-hidden="true"
                  />
                  <span class="repertoire-folder-visibility__option-title">Acesso ao sistema</span>
                  <span class="repertoire-folder-visibility__option-hint">
                    {{ form.hasSystemAccess
                      ? 'Com acesso: a pessoa pode fazer login e usar o Bless App.'
                      : 'Sem acesso: a pessoa não pode fazer login no Bless App.' }}
                  </span>
                </button>

                <button
                  type="button"
                  data-unsaved-change
                  class="repertoire-folder-visibility__option"
                  :class="{ 'repertoire-folder-visibility__option--selected': form.isAdmin }"
                  :disabled="!form.hasSystemAccess"
                  :aria-pressed="form.isAdmin ? 'true' : 'false'"
                  @click="toggleAdmin"
                >
                  <component
                    :is="form.isAdmin ? 'ShieldCheckIcon' : 'ShieldIcon'"
                    :size="22"
                    aria-hidden="true"
                  />
                  <span class="repertoire-folder-visibility__option-title">Administrador</span>
                  <span class="repertoire-folder-visibility__option-hint">
                    {{ form.isAdmin
                      ? 'Administrador ativo: acesso total às funções administrativas do sistema.'
                      : 'Não é administrador: permissões limitadas aos perfis atribuídos.' }}
                  </span>
                </button>
              </div>

              <p
                v-if="form.hasSystemAccess && !form.email.trim()"
                class="description person-system-access__hint"
                role="alert"
              >
                Informe o e-mail da pessoa para conceder acesso ao sistema.
              </p>
            </div>

            <div
              v-if="form.hasSystemAccess"
              class="repertoire-form__field--full person-role-picker person-assignment-picker"
            >
              <div class="repertoire-theme-picker__header">
                <span class="repertoire-theme-picker__label">
                  Perfis de acesso
                  <span class="repertoire-theme-picker__hint">
                    (Selecione um ou mais perfis)
                  </span>
                </span>
              </div>

              <p
                v-if="form.isAdmin"
                class="description person-role-picker__hint"
              >
                Administradores já possuem acesso total; os perfis abaixo são opcionais
                e entram em vigor após o próximo login ou renovação de sessão.
              </p>

              <p v-if="availableRoles.length === 0" class="description">
                Nenhum perfil de acesso ativo cadastrado.
              </p>

              <div
                v-else
                class="repertoire-theme-picker__options"
                role="group"
                aria-label="Selecionar perfis de acesso"
              >
                <AppTooltip
                  v-for="role in availableRoles"
                  :key="role.id"
                  class="person-role-picker__tooltip"
                  :text="getRoleDescription(role.name)"
                >
                  <button
                    type="button"
                    data-unsaved-change
                    class="repertoire-theme-picker__option"
                    :class="{
                      'repertoire-theme-picker__option--selected': isRoleSelected(role.id),
                      'repertoire-theme-picker__option--animating': animatedRoleId === role.id
                    }"
                    :aria-pressed="isRoleSelected(role.id) ? 'true' : 'false'"
                    @click="toggleRole(role.id)"
                    @animationend="clearRoleAnimation(role.id, $event)"
                  >
                    <ShieldIcon :size="14" aria-hidden="true" />
                    {{ getRoleDisplayName(role.name) }}
                  </button>
                </AppTooltip>
              </div>
            </div>

            <div
              v-if="form.hasSystemAccess"
              class="repertoire-form__field--full person-password-fields"
            >
              <h3 class="person-password-fields__title">
                {{ details?.hasPassword ? 'Alterar senha' : 'Definir senha' }}
              </h3>
              <p class="description person-password-fields__hint">
                {{ details?.hasPassword
                  ? 'Deixe em branco para manter a senha atual. A senha nunca é exibida.'
                  : 'Defina uma senha para a pessoa poder fazer login. Você pode enviá-la por um canal seguro.' }}
              </p>

              <div class="person-password-fields__grid">
                <label>
                  {{ details?.hasPassword ? 'Nova senha' : 'Senha' }}
                  <input
                    v-model="form.password"
                    type="password"
                    class="field-control"
                    :class="{ 'field-control--invalid': passwordError }"
                    autocomplete="new-password"
                    :placeholder="details?.hasPassword ? 'Nova senha (opcional)' : 'Crie uma senha segura'"
                    :aria-invalid="passwordError ? 'true' : 'false'"
                    @input="clearPasswordErrors"
                  >
                </label>

                <label>
                  Confirmar senha
                  <input
                    v-model="form.confirmPassword"
                    type="password"
                    class="field-control"
                    :class="{ 'field-control--invalid': confirmPasswordError }"
                    autocomplete="new-password"
                    placeholder="Digite a senha novamente"
                    :aria-invalid="confirmPasswordError ? 'true' : 'false'"
                    @input="clearConfirmPasswordError"
                  >
                  <span
                    v-if="confirmPasswordError"
                    class="field-error"
                    role="alert"
                  >
                    {{ confirmPasswordError }}
                  </span>
                </label>
              </div>

              <div
                v-if="form.password"
                class="auth-password-strength"
                aria-live="polite"
              >
                <div class="auth-password-strength__header">
                  <span class="auth-password-strength__label">Força da senha</span>
                  <span
                    class="auth-password-strength__value"
                    :class="`auth-password-strength__value--${passwordStrengthLevel}`"
                  >
                    {{ passwordStrengthLabel }}
                  </span>
                </div>
                <div
                  class="auth-password-strength__bar"
                  role="progressbar"
                  :aria-valuenow="passwordStrengthPercent"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <span
                    class="auth-password-strength__fill"
                    :class="`auth-password-strength__fill--${passwordStrengthLevel}`"
                    :style="{ width: `${passwordStrengthPercent}%` }"
                  />
                </div>
                <ul class="auth-password-requirements">
                  <li
                    v-for="requirement in passwordRequirements"
                    :key="requirement.id"
                    class="auth-password-requirements__item"
                    :class="{ 'auth-password-requirements__item--met': requirement.met }"
                  >
                    {{ requirement.label }}
                  </li>
                </ul>
              </div>

              <span
                v-if="passwordError"
                class="field-error"
                role="alert"
              >
                {{ passwordError }}
              </span>
            </div>
          </template>

          <template v-else-if="details">
            <div class="repertoire-form__field--full">
              <div
                class="repertoire-folder-visibility__options person-system-access__options"
                role="group"
                aria-label="Configurações de acesso ao sistema"
              >
                <div
                  class="repertoire-folder-visibility__option person-system-access__option--readonly"
                  :class="{ 'repertoire-folder-visibility__option--selected': details.hasSystemAccess }"
                  aria-disabled="true"
                >
                  <component
                    :is="details.hasSystemAccess ? 'LogInIcon' : 'LockIcon'"
                    :size="22"
                    aria-hidden="true"
                  />
                  <span class="repertoire-folder-visibility__option-title">Acesso ao sistema</span>
                  <span class="repertoire-folder-visibility__option-hint">
                    {{ details.hasSystemAccess
                      ? 'Com acesso: a pessoa pode fazer login e usar o Bless App.'
                      : 'Sem acesso: a pessoa não pode fazer login no Bless App.' }}
                  </span>
                </div>

                <div
                  class="repertoire-folder-visibility__option person-system-access__option--readonly"
                  :class="{ 'repertoire-folder-visibility__option--selected': details.isAdmin }"
                  aria-disabled="true"
                >
                  <component
                    :is="details.isAdmin ? 'ShieldCheckIcon' : 'ShieldIcon'"
                    :size="22"
                    aria-hidden="true"
                  />
                  <span class="repertoire-folder-visibility__option-title">Administrador</span>
                  <span class="repertoire-folder-visibility__option-hint">
                    {{ details.isAdmin
                      ? 'Administrador ativo: acesso total às funções administrativas do sistema.'
                      : 'Não é administrador: permissões limitadas aos perfis atribuídos.' }}
                  </span>
                </div>
              </div>
            </div>

            <div
              v-if="details.hasSystemAccess || details.roles.length > 0"
              class="repertoire-form__field--full"
            >
              <span class="repertoire-theme-picker__label">Perfis de acesso</span>
              <p v-if="details.roles.length === 0" class="description">
                Nenhum perfil de acesso vinculado.
              </p>
              <div
                v-else
                class="people-assignment-list"
                role="list"
              >
                <AppTooltip
                  v-for="role in details.roles"
                  :key="`role-${role.id}`"
                  class="person-role-picker__tooltip"
                  :text="getRoleDescription(role.name)"
                >
                  <span
                    class="repertoire-badge"
                    role="listitem"
                  >
                    {{ getRoleDisplayName(role.name) }}
                  </span>
                </AppTooltip>
              </div>
            </div>

            <label v-if="details.hasSystemUser">
              Usuário vinculado
              <p class="person-details-form__value">
                {{ details.systemUserEmail || 'E-mail não informado' }}
              </p>
            </label>

            <label v-if="details.hasSystemUser">
              Último acesso
              <p class="person-details-form__value">
                {{ formatDateTime(details.systemLastLoginAt) }}
              </p>
            </label>
          </template>
        </div>
      </section>

      <section
        v-if="isSelfProfile && canEdit"
        class="repertoire-card"
      >
        <h2>Alterar senha</h2>
        <p class="description">
          Por segurança, informe a senha atual e a nova senha. A senha atual nunca é exibida.
        </p>

        <div class="repertoire-form repertoire-form--grid person-details-form__grid">
          <label class="repertoire-form__field--full">
            Senha atual
            <input
              v-model="ownPasswordForm.currentPassword"
              type="password"
              class="field-control"
              :class="{ 'field-control--invalid': ownCurrentPasswordError }"
              autocomplete="current-password"
              placeholder="Digite sua senha atual"
              :aria-invalid="ownCurrentPasswordError ? 'true' : 'false'"
              @input="clearOwnPasswordErrors"
            >
            <span
              v-if="ownCurrentPasswordError"
              class="field-error"
              role="alert"
            >
              {{ ownCurrentPasswordError }}
            </span>
          </label>

          <label>
            Nova senha
            <input
              v-model="ownPasswordForm.newPassword"
              type="password"
              class="field-control"
              :class="{ 'field-control--invalid': ownNewPasswordError }"
              autocomplete="new-password"
              placeholder="Crie uma senha segura"
              :aria-invalid="ownNewPasswordError ? 'true' : 'false'"
              @input="clearOwnPasswordErrors"
            >
          </label>

          <label>
            Confirmar nova senha
            <input
              v-model="ownPasswordForm.confirmPassword"
              type="password"
              class="field-control"
              :class="{ 'field-control--invalid': ownConfirmPasswordError }"
              autocomplete="new-password"
              placeholder="Digite a senha novamente"
              :aria-invalid="ownConfirmPasswordError ? 'true' : 'false'"
              @input="clearOwnPasswordErrors"
            >
            <span
              v-if="ownConfirmPasswordError"
              class="field-error"
              role="alert"
            >
              {{ ownConfirmPasswordError }}
            </span>
          </label>

          <div
            v-if="ownPasswordForm.newPassword"
            class="repertoire-form__field--full auth-password-strength"
            aria-live="polite"
          >
            <div class="auth-password-strength__header">
              <span class="auth-password-strength__label">Força da senha</span>
              <span
                class="auth-password-strength__value"
                :class="`auth-password-strength__value--${ownPasswordStrengthLevel}`"
              >
                {{ ownPasswordStrengthLabel }}
              </span>
            </div>
            <div
              class="auth-password-strength__bar"
              role="progressbar"
              :aria-valuenow="ownPasswordStrengthPercent"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <span
                class="auth-password-strength__fill"
                :class="`auth-password-strength__fill--${ownPasswordStrengthLevel}`"
                :style="{ width: `${ownPasswordStrengthPercent}%` }"
              />
            </div>
            <ul class="auth-password-requirements">
              <li
                v-for="requirement in ownPasswordRequirements"
                :key="requirement.id"
                class="auth-password-requirements__item"
                :class="{ 'auth-password-requirements__item--met': requirement.met }"
              >
                {{ requirement.label }}
              </li>
            </ul>
          </div>

          <span
            v-if="ownNewPasswordError"
            class="field-error repertoire-form__field--full"
            role="alert"
          >
            {{ ownNewPasswordError }}
          </span>

          <div class="repertoire-form__field--full repertoire-details-form__actions">
            <button
              type="button"
              class="repertoire-button"
              :disabled="passwordLoading || !hasOwnPasswordInput"
              @click="handleChangeOwnPassword"
            >
              {{ passwordLoading ? 'Alterando...' : 'Alterar senha' }}
            </button>
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
  LockIcon,
  LogInIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UsersIcon
} from '@lucide/vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { ministryService } from '@/services/ministryService'
import { personService } from '@/services/personService'
import { roleAdminService } from '@/services/roleAdminService'
import { skillService } from '@/services/skillService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type { AccessRole } from '@/types/roles'
import type {
  CreatePersonRequest,
  Ministry,
  PersonDetails,
  Skill,
  UpdateSelfPersonRequest
} from '@/types/people'
import { Permissions } from '@/utils/permissions'
import {
  formatBrazilianMobilePhone,
  isValidBrazilianMobilePhone,
  normalizePhoneDigits
} from '@/utils/phone'
import { isValidEmail, normalizeEmail } from '@/utils/email'
import {
  getPasswordRequirements,
  getPasswordStrengthLabel,
  getPasswordStrengthLevel,
  getPasswordStrengthPercent,
  isPasswordValid
} from '@/utils/passwordStrength'
import { getRoleDescription, getRoleDisplayName } from '@/utils/roleLabels'

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
  hasSystemAccess: boolean
  isAdmin: boolean
  roleIds: number[]
  password: string
  confirmPassword: string
}

type OwnPasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
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
    skillIds: [],
    hasSystemAccess: false,
    isAdmin: false,
    roleIds: [],
    password: '',
    confirmPassword: ''
  }
}

function createEmptyOwnPasswordForm(): OwnPasswordForm {
  return {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

export default defineComponent({
  name: 'PersonDetailsView',
  components: {
    AppTooltip,
    ArrowLeftIcon,
    AwardIcon,
    ChurchIcon,
    LockIcon,
    LogInIcon,
    RouterLink,
    ShieldCheckIcon,
    ShieldIcon,
    UsersIcon
  },
  data() {
    return {
      form: createEmptyForm(),
      details: null as PersonDetails | null,
      availableMinistries: [] as Ministry[],
      availableSkills: [] as Skill[],
      availableRoles: [] as AccessRole[],
      fullNameMaxLength: FULL_NAME_MAX_LENGTH,
      preferredNameMaxLength: PREFERRED_NAME_MAX_LENGTH,
      notesMaxLength: NOTES_MAX_LENGTH,
      fullNameError: '',
      mobilePhoneError: '',
      emailError: '',
      emailAvailabilityToken: 0,
      emailAvailabilityTimeoutId: null as number | null,
      pageLoading: false,
      loading: false,
      passwordLoading: false,
      passwordError: '',
      confirmPasswordError: '',
      ownPasswordForm: createEmptyOwnPasswordForm(),
      ownCurrentPasswordError: '',
      ownNewPasswordError: '',
      ownConfirmPasswordError: '',
      animatedMinistryId: null as number | null,
      animatedSkillId: null as number | null,
      animatedRoleId: null as number | null
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
    isSelfProfile(): boolean {
      return this.$route.meta.selfProfile === true
    },
    isEmailLocked(): boolean {
      return this.isSelfProfile || Boolean(this.details?.hasSystemUser)
    },
    emailLockTooltip(): string {
      if (this.isSelfProfile) {
        return 'Não é possível alterar o e-mail.'
      }

      return 'Não é possível alterar o e-mail de quem já é usuário do sistema'
    },
    canEdit(): boolean {
      return this.canManagePeople || this.isSelfProfile
    },
    canEditSystemAccess(): boolean {
      return this.isAdmin && !this.isSelfProfile
    },
    showSystemAccessSection(): boolean {
      return this.canEditSystemAccess || (!this.isCreateMode && Boolean(this.details))
    },
    passwordRequirements() {
      return getPasswordRequirements(this.form.password)
    },
    passwordStrengthLevel() {
      return getPasswordStrengthLevel(this.form.password)
    },
    passwordStrengthLabel() {
      return getPasswordStrengthLabel(this.passwordStrengthLevel)
    },
    passwordStrengthPercent() {
      return getPasswordStrengthPercent(this.passwordStrengthLevel)
    },
    ownPasswordRequirements() {
      return getPasswordRequirements(this.ownPasswordForm.newPassword)
    },
    ownPasswordStrengthLevel() {
      return getPasswordStrengthLevel(this.ownPasswordForm.newPassword)
    },
    ownPasswordStrengthLabel() {
      return getPasswordStrengthLabel(this.ownPasswordStrengthLevel)
    },
    ownPasswordStrengthPercent() {
      return getPasswordStrengthPercent(this.ownPasswordStrengthLevel)
    },
    hasOwnPasswordInput(): boolean {
      return Boolean(
        this.ownPasswordForm.currentPassword
          || this.ownPasswordForm.newPassword
          || this.ownPasswordForm.confirmPassword
      )
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
    getRoleDescription,
    getRoleDisplayName,

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
      const lookups: Promise<void>[] = [
        this.loadMinistriesAndSkills()
      ]

      if (this.canEditSystemAccess) {
        lookups.push(this.loadRoles())
      }

      await Promise.all(lookups)
    },

    async loadMinistriesAndSkills(): Promise<void> {
      const [ministriesResponse, skillsResponse] = await Promise.all([
        ministryService.list(),
        skillService.list()
      ])

      this.availableMinistries = (ministriesResponse.payload ?? []).filter((item) => item.isActive)
      this.availableSkills = skillsResponse.payload ?? []
    },

    async loadRoles(): Promise<void> {
      const response = await roleAdminService.list()
      this.availableRoles = (response.payload ?? []).filter((item) => item.isActive)
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
        skillIds: details.skills.map((skill) => skill.id),
        hasSystemAccess: details.hasSystemAccess,
        isAdmin: details.isAdmin,
        roleIds: (details.roles ?? []).map((role) => role.id),
        password: '',
        confirmPassword: ''
      }
    },

    async loadDetails(id: number): Promise<void> {
      const response = await personService.getById(id)
      const details = response.payload

      if (!details) {
        throw new Error('Pessoa não encontrada.')
      }

      this.applyDetails(details)

      if (this.canEditSystemAccess && this.availableRoles.length === 0) {
        await this.loadRoles()
      }
    },

    toggleSystemAccess(): void {
      this.form.hasSystemAccess = !this.form.hasSystemAccess

      if (!this.form.hasSystemAccess) {
        this.form.isAdmin = false
        this.form.roleIds = []
        this.form.password = ''
        this.form.confirmPassword = ''
        this.clearPasswordErrors()
      }
    },

    toggleAdmin(): void {
      if (!this.form.hasSystemAccess) {
        return
      }

      this.form.isAdmin = !this.form.isAdmin
    },

    isMinistrySelected(ministryId: number): boolean {
      return this.form.ministryIds.includes(ministryId)
    },

    isSkillSelected(skillId: number): boolean {
      return this.form.skillIds.includes(skillId)
    },

    isRoleSelected(roleId: number): boolean {
      return this.form.roleIds.includes(roleId)
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

    toggleRole(roleId: number): void {
      this.animatedRoleId = roleId

      if (this.isRoleSelected(roleId)) {
        this.form.roleIds = this.form.roleIds.filter((id) => id !== roleId)
        return
      }

      this.form.roleIds = [...this.form.roleIds, roleId]
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

    clearRoleAnimation(roleId: number, event: AnimationEvent): void {
      if (event.target !== event.currentTarget) {
        return
      }

      if (this.animatedRoleId === roleId) {
        this.animatedRoleId = null
      }
    },

    formatDateTime(value: string | null): string {
      if (!value) {
        return 'Nunca acessou'
      }

      return new Date(value).toLocaleString('pt-BR')
    },

    clearFullNameError(): void {
      this.fullNameError = ''
    },

    clearPasswordErrors(): void {
      this.passwordError = ''
      this.confirmPasswordError = ''
    },

    clearConfirmPasswordError(): void {
      this.confirmPasswordError = ''
    },

    clearOwnPasswordErrors(): void {
      this.ownCurrentPasswordError = ''
      this.ownNewPasswordError = ''
      this.ownConfirmPasswordError = ''
    },

    resetOwnPasswordForm(): void {
      this.ownPasswordForm = createEmptyOwnPasswordForm()
      this.clearOwnPasswordErrors()
    },

    validateAdminPasswordFields(): boolean {
      this.clearPasswordErrors()

      if (!this.canEditSystemAccess || !this.form.hasSystemAccess) {
        return true
      }

      const password = this.form.password
      const confirmPassword = this.form.confirmPassword

      if (!password && !confirmPassword) {
        return true
      }

      if (!isPasswordValid(password)) {
        this.passwordError = 'A senha não atende aos requisitos mínimos de segurança.'
        return false
      }

      if (password !== confirmPassword) {
        this.confirmPasswordError = 'As senhas informadas não coincidem.'
        return false
      }

      return true
    },

    validateOwnPasswordForm(): boolean {
      this.clearOwnPasswordErrors()

      if (!this.ownPasswordForm.currentPassword) {
        this.ownCurrentPasswordError = 'Informe a senha atual.'
      }

      if (!isPasswordValid(this.ownPasswordForm.newPassword)) {
        this.ownNewPasswordError = 'A nova senha não atende aos requisitos mínimos de segurança.'
      }

      if (this.ownPasswordForm.newPassword !== this.ownPasswordForm.confirmPassword) {
        this.ownConfirmPasswordError = 'As senhas informadas não coincidem.'
      }

      return !this.ownCurrentPasswordError
        && !this.ownNewPasswordError
        && !this.ownConfirmPasswordError
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
      const token = this.emailAvailabilityToken + 1
      this.emailAvailabilityToken = token

      this.emailAvailabilityTimeoutId = window.setTimeout(() => {
        void this.checkEmailAvailability(token)
      }, EMAIL_AVAILABILITY_DEBOUNCE_MS)
    },

    async checkEmailAvailability(token: number): Promise<void> {
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

        if (token !== this.emailAvailabilityToken) {
          return
        }

        if (availability && !availability.isAvailable) {
          this.emailError = availability.reason || 'Este e-mail já está cadastrado no sistema.'
          return
        }

        this.emailError = ''
      } catch {
        if (token !== this.emailAvailabilityToken) {
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

      if (this.form.hasSystemAccess && !this.form.email.trim() && !this.isSelfProfile) {
        toastService.error('Informe o e-mail da pessoa para conceder acesso ao sistema.')
        return false
      }

      if (this.form.mobilePhone && !isValidBrazilianMobilePhone(this.form.mobilePhone)) {
        this.mobilePhoneError =
          'Informe um celular válido com DDD e número começando com 9. Ex.: (41) 99999-9999.'
      }

      if (!this.validateAdminPasswordFields()) {
        return false
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
      const password = this.form.password.trim()

      return {
        fullName: this.form.fullName.trim(),
        preferredName: this.form.preferredName.trim() || null,
        birthDate: this.form.birthDate || null,
        email: this.form.email.trim() || null,
        mobilePhone: normalizePhoneDigits(this.form.mobilePhone) || null,
        notes: this.form.notes.trim() || null,
        ministryIds: [...this.form.ministryIds],
        skillIds: [...this.form.skillIds],
        hasSystemAccess: this.form.hasSystemAccess,
        isAdmin: this.form.isAdmin,
        roleIds: this.form.hasSystemAccess ? [...this.form.roleIds] : [],
        password: this.form.hasSystemAccess && password ? password : null
      }
    },

    async handleChangeOwnPassword(): Promise<void> {
      if (!this.isSelfProfile || !this.validateOwnPasswordForm()) {
        return
      }

      this.passwordLoading = true

      try {
        const response = await personService.changeOwnPassword({
          currentPassword: this.ownPasswordForm.currentPassword,
          newPassword: this.ownPasswordForm.newPassword
        })
        toastService.success(response.message)
        this.resetOwnPasswordForm()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao alterar a senha.'
        )
      } finally {
        this.passwordLoading = false
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
          await this.authStore.refreshUser()
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
        this.form.password = ''
        this.form.confirmPassword = ''
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

<template>

  <main class="auth-page">

    <div class="auth-page__backdrop" aria-hidden="true">

      <div class="auth-page__intro">

        <p class="auth-page__intro-eyebrow">Bless App</p>

        <p class="auth-page__intro-text">
          Ferramenta não oficial de gerenciamento para igrejas.
        </p>

      </div>

    </div>



    <section class="auth-card auth-card--register fluent-card">

      <header class="auth-header">

        <p class="eyebrow">

          Bless App

        </p>

        <h1>Criar conta</h1>

        <p class="description">

          Cadastre um usuário para acessar o sistema.

        </p>

      </header>



      <form v-unsaved-changes class="auth-form" @submit.prevent="handleSubmit">

        <label>

          Nome completo *

          <input

            v-model="form.fullName"

            type="text"

            class="field-control auth-form__input"

            maxlength="100"

            autocomplete="name"

            placeholder="Seu nome completo"

            required

          >

        </label>



        <label>

          Nome preferido

          <input

            v-model="form.preferredName"

            type="text"

            class="field-control auth-form__input"

            maxlength="100"

            autocomplete="nickname"

            placeholder="Como prefere ser chamado"

          >

        </label>



        <label>

          E-mail *

          <input

            v-model="form.email"

            type="email"

            class="field-control auth-form__input"

            maxlength="254"

            autocomplete="email"

            placeholder="seu@email.com"

            required

          >

        </label>



        <label>

          Senha *

          <input

            v-model="form.password"

            type="password"

            class="field-control auth-form__input"

            :class="{ 'field-control--invalid': passwordError }"

            autocomplete="new-password"

            placeholder="Crie uma senha segura"

            required

            @input="clearPasswordErrors"

          >

        </label>



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



        <label>

          Confirmar senha *

          <input

            v-model="form.confirmPassword"

            type="password"

            class="field-control auth-form__input"

            :class="{ 'field-control--invalid': confirmPasswordError }"

            autocomplete="new-password"

            placeholder="Digite a senha novamente"

            required

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



        <span

          v-if="passwordError"

          class="field-error auth-form__error"

          role="alert"

        >

          {{ passwordError }}

        </span>



        <button type="submit" class="auth-submit" :disabled="loading">

          {{ loading ? 'Cadastrando...' : 'Cadastrar' }}

        </button>

      </form>



      <p v-if="message" class="status-message" :class="{ error: hasError }">

        {{ message }}

      </p>



      <p class="auth-footer">

        Já possui conta?

        <RouterLink :to="{ name: 'login' }">

          Fazer login

        </RouterLink>

      </p>

    </section>

  </main>

</template>



<script lang="ts">

import { defineComponent } from 'vue'

import { RouterLink } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'

import {

  getPasswordRequirements,

  getPasswordStrengthLabel,

  getPasswordStrengthLevel,

  getPasswordStrengthPercent,

  isPasswordValid

} from '@/utils/passwordStrength'



type RegisterForm = {

  fullName: string

  preferredName: string

  email: string

  password: string

  confirmPassword: string

}



export default defineComponent({

  name: 'RegisterView',

  components: {

    RouterLink

  },

  data() {

    return {

      form: {

        fullName: '',

        preferredName: '',

        email: '',

        password: '',

        confirmPassword: ''

      } as RegisterForm,

      loading: false,

      hasError: false,

      message: '',

      passwordError: '',

      confirmPasswordError: ''

    }

  },

  computed: {

    authStore() {

      return useAuthStore()

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

    }

  },

  methods: {

    clearPasswordErrors(): void {

      this.passwordError = ''

    },



    clearConfirmPasswordError(): void {

      this.confirmPasswordError = ''

    },



    validateForm(): boolean {

      this.passwordError = ''

      this.confirmPasswordError = ''



      if (!isPasswordValid(this.form.password)) {

        this.passwordError = 'A senha não atende aos requisitos mínimos de segurança.'

      }



      if (this.form.password !== this.form.confirmPassword) {

        this.confirmPasswordError = 'As senhas informadas não coincidem.'

      }



      return !this.passwordError && !this.confirmPasswordError

    },



    async handleSubmit(): Promise<void> {

      if (!this.validateForm()) {

        return

      }



      this.loading = true

      this.hasError = false

      this.message = 'Cadastrando usuário...'



      try {

        const successMessage = await this.authStore.register({

          fullName: this.form.fullName.trim(),

          email: this.form.email.trim(),

          password: this.form.password,

          preferredName: this.form.preferredName.trim() || null

        })



        this.message = successMessage

        await this.$router.push({
          name: 'login',
          query: { registration: 'pending' }
        })

      } catch (error) {

        this.hasError = true

        this.message = error instanceof Error ? error.message : 'Erro inesperado ao cadastrar.'

      } finally {

        this.loading = false

      }

    }

  }

})

</script>



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

    <section class="auth-card fluent-card">
      <header class="auth-header">
        <p class="eyebrow">
          Bless App
        </p>
        <h1>Entrar</h1>
        <p class="description">
          Informe seu e-mail e senha para acessar o sistema.
        </p>
      </header>

      <form class="auth-form" @submit.prevent="handleSubmit">
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
            autocomplete="current-password"
            placeholder="Sua senha"
            required
          >
        </label>

        <button type="submit" class="auth-submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div
        v-if="loading"
        class="auth-loading"
        role="status"
        aria-live="polite"
        aria-label="Carregando"
      >
        <span class="app-spinner" aria-hidden="true" />
      </div>

      <p v-else-if="message" class="status-message" :class="{ error: hasError }">
        {{ message }}
      </p>

      <p class="auth-footer">
        Ainda não tem conta?
        <RouterLink :to="{ name: 'register' }">
          Criar cadastro
        </RouterLink>
      </p>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

type LoginForm = {
  email: string
  password: string
}

export default defineComponent({
  name: 'LoginView',
  components: {
    RouterLink
  },
  data() {
    return {
      form: {
        email: '',
        password: ''
      } as LoginForm,
      loading: false,
      hasError: false,
      message: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    }
  },
  mounted() {
    if (this.$route.query.registration === 'pending') {
      this.message = 'Cadastro realizado. Aguarde a liberação de um administrador para acessar o sistema.'
    }
  },
  methods: {
    async handleSubmit(): Promise<void> {
      this.loading = true
      this.hasError = false
      this.message = ''

      try {
        await this.authStore.login({
          email: this.form.email.trim(),
          password: this.form.password
        })

        const redirectPath = typeof this.$route.query.redirect === 'string'
          ? this.$route.query.redirect
          : null

        await this.$router.push(redirectPath ?? { name: 'home' })
      } catch (error) {
        this.hasError = true
        this.message = error instanceof Error ? error.message : 'Erro inesperado ao entrar.'
      } finally {
        this.loading = false
      }
    }
  }
})
</script>

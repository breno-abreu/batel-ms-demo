import { defineStore } from 'pinia'
import {
  getTodayBirthdayKey,
  markBirthdayGreetingShown,
  wasBirthdayGreetingShown
} from '@/services/birthdayGreetingStorage'
import { personService } from '@/services/personService'
import type { PersonBirthdayItem } from '@/types/people'

type BirthdayGreetingState = {
  items: PersonBirthdayItem[]
  visible: boolean
  loaded: boolean
  loading: boolean
}

export const useBirthdayGreetingStore = defineStore('birthdayGreeting', {
  state: (): BirthdayGreetingState => ({
    items: [],
    visible: false,
    loaded: false,
    loading: false
  }),
  getters: {
    hasBirthdaysToday(state): boolean {
      return state.items.length > 0
    },
    greetingCopy(state): string {
      if (state.items.length === 1) {
        return 'Uma pessoa especial está comemorando o dia dela.'
      }

      return 'Tem gente especial comemorando o dia dela.'
    }
  },
  actions: {
    async loadToday(force = false): Promise<void> {
      if (this.loading) {
        return
      }

      if (this.loaded && !force) {
        return
      }

      this.loading = true

      try {
        const today = new Date()
        const response = await personService.listBirthdays(
          today.getMonth() + 1,
          today.getDate()
        )
        this.items = response.payload ?? []
        this.loaded = true
      } catch {
        this.items = []
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    async tryAutoShow(): Promise<void> {
      const dateKey = getTodayBirthdayKey()

      if (wasBirthdayGreetingShown(dateKey)) {
        await this.loadToday()
        return
      }

      await this.loadToday()

      if (this.items.length === 0) {
        return
      }

      this.visible = true
      markBirthdayGreetingShown(dateKey)
    },

    async open(): Promise<void> {
      await this.loadToday()

      if (this.items.length === 0) {
        return
      }

      this.visible = true
      markBirthdayGreetingShown(getTodayBirthdayKey())
    },

    close(): void {
      this.visible = false
    },

    reset(): void {
      this.items = []
      this.visible = false
      this.loaded = false
      this.loading = false
    }
  }
})

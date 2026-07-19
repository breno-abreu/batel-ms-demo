<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header">
      <div class="repertoire-page__header-title">
        <span class="repertoire-page__header-icon" aria-hidden="true">
          <CakeIcon :size="20" />
        </span>
        <h1>Aniversários</h1>
      </div>
      <p class="description repertoire-page__header-description">
        Consulte os aniversariantes do mês a partir do cadastro de pessoas.
      </p>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Aniversariantes</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>

      <div class="repertoire-form birthday-filters">
        <label>
          Mês
          <select
            id="birthday-month"
            v-model.number="selectedMonth"
            :disabled="listLoading"
          >
            <option
              v-for="monthOption in monthOptions"
              :key="monthOption.value"
              :value="monthOption.value"
            >
              {{ monthOption.label }}
            </option>
          </select>
        </label>
      </div>

      <AppListSkeleton
        v-if="listLoading"
        :rows="6"
      />

      <p v-else-if="items.length === 0" class="description">
        Nenhum aniversariante cadastrado em {{ selectedMonthLabel }}.
      </p>

      <div
        v-else
        class="birthday-card-grid"
      >
        <article
          v-for="item in items"
          :key="item.id"
          class="birthday-card fluent-card"
        >
          <span class="birthday-card__day" aria-hidden="true">
            {{ item.day }}
          </span>
          <div class="birthday-card__content">
            <span class="birthday-card__month">{{ monthLabel(item.month) }}</span>
            <span class="birthday-card__name">{{ displayName(item) }}</span>
          </div>
          <span class="birthday-card__icon" aria-hidden="true">
            <CakeIcon :size="18" />
          </span>
        </article>
      </div>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CakeIcon } from '@lucide/vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import { personService } from '@/services/personService'
import { toastService } from '@/services/toastService'
import type { PersonBirthdayItem } from '@/types/people'
import { MONTH_OPTIONS } from '@/utils/monthlySchedule'

export default defineComponent({
  name: 'BirthdayListView',
  components: {
    AppListSkeleton,
    CakeIcon
  },
  data() {
    return {
      selectedMonth: new Date().getMonth() + 1,
      monthOptions: MONTH_OPTIONS,
      items: [] as PersonBirthdayItem[],
      listLoading: false
    }
  },
  computed: {
    selectedMonthLabel(): string {
      return this.monthLabel(this.selectedMonth)
    },
    listCountLabel(): string {
      if (this.listLoading) {
        return '—'
      }

      return String(this.items.length)
    }
  },
  watch: {
    selectedMonth(): void {
      void this.loadItems()
    }
  },
  mounted() {
    void this.loadItems()
  },
  methods: {
    displayName(item: PersonBirthdayItem): string {
      return item.preferredName || item.fullName
    },

    monthLabel(month: number): string {
      return this.monthOptions.find((option) => option.value === month)?.label ?? String(month)
    },

    async loadItems(): Promise<void> {
      this.listLoading = true

      try {
        const response = await personService.listBirthdays(this.selectedMonth)
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar os aniversariantes.'
        )
      } finally {
        this.listLoading = false
      }
    }
  }
})
</script>

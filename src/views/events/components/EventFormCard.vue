<template>
  <Teleport to="body">
    <Transition name="event-form-card">
      <div
        v-if="modelValue"
        class="event-form-card-overlay"
        role="presentation"
      >
        <section
          ref="modalContainer"
          class="event-form-card fluent-card"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <button
            type="button"
            class="event-form-card__close"
            aria-label="Fechar"
            @click="handleCancel"
          >
            <XIcon :size="16" aria-hidden="true" />
          </button>

          <h2 :id="titleId" class="event-form-card__title">
            {{ isEdit ? 'Editar evento' : 'Novo evento' }}
          </h2>

          <form
            ref="eventForm"
            v-unsaved-changes
            class="event-form-card__form"
            novalidate
            @submit.prevent="handleSubmit"
          >
            <div
              ref="modalBody"
              class="event-form-card__body"
              :class="{ 'event-form-card__body--can-scroll': bodyCanScroll }"
            >
            <div class="event-form-card__schedule-row">
              <AppTooltip
                :text="isEdit ? '' : 'O cronograma só pode ser editado após a criação do evento.'"
                position="top"
              >
                <button
                  type="button"
                  class="field-button field-button--ghost event-form-card__schedule-button"
                  :disabled="loading || !isEdit"
                  :aria-disabled="!isEdit"
                  @click="handleOpenSchedule"
                >
                  <ListOrderedIcon :size="16" aria-hidden="true" />
                  {{ isEdit ? 'Abrir cronograma' : 'Abrir cronograma (disponível após criar o evento)' }}
                </button>
              </AppTooltip>
            </div>

            <label>
              Nome *
              <input
                v-model="localForm.name"
                type="text"
                class="field-control"
                :maxlength="nameMaxLength"
                placeholder="Ex.: Culto de sábado"
                :class="{ 'field-control--invalid': nameError }"
                :aria-invalid="nameError ? 'true' : 'false'"
                :aria-describedby="nameError ? 'event-form-name-counter event-form-name-error' : 'event-form-name-counter'"
                @input="clearNameError"
              >
              <span
                id="event-form-name-counter"
                class="field-counter"
                aria-live="polite"
              >
                {{ localForm.name.length }}/{{ nameMaxLength }}
              </span>
              <span
                v-if="nameError"
                id="event-form-name-error"
                class="field-error"
                role="alert"
              >
                {{ nameError }}
              </span>
            </label>

            <label>
              Descrição
              <textarea
                v-model="localForm.description"
                class="field-control"
                rows="3"
                :maxlength="descriptionMaxLength"
                placeholder="Descrição opcional"
                aria-describedby="event-form-description-counter"
              />
              <span
                id="event-form-description-counter"
                class="field-counter"
                aria-live="polite"
              >
                {{ localForm.description.length }}/{{ descriptionMaxLength }}
              </span>
            </label>

            <label>
              Tipo *
              <select
                v-model="localForm.eventTypeId"
                class="field-control"
                :class="{ 'field-control--invalid': eventTypeError }"
                :aria-invalid="eventTypeError ? 'true' : 'false'"
                @change="clearEventTypeError"
              >
                <option :value="null">
                  Selecione o tipo
                </option>
                <option
                  v-for="eventType in selectableEventTypes"
                  :key="eventType.id"
                  :value="eventType.id"
                >
                  {{ eventType.name }}
                </option>
              </select>
              <span v-if="eventTypeError" class="field-error" role="alert">
                {{ eventTypeError }}
              </span>
            </label>

            <label>
              Ministério responsável
              <select
                v-model="localForm.ministryId"
                class="field-control"
                @change="handleMinistryChange"
              >
                <option :value="null">
                  Nenhum
                </option>
                <option
                  v-for="ministry in ministries"
                  :key="ministry.id"
                  :value="ministry.id"
                >
                  {{ ministry.name }}
                </option>
              </select>
            </label>

            <label>
              Pessoa responsável
              <AppSearchableSelect
                v-model="localForm.responsiblePersonId"
                :options="personSelectOptions"
                placeholder="Nenhuma"
                clear-label="Nenhuma"
                search-placeholder="Buscar pessoa..."
                empty-message="Nenhuma pessoa disponível"
                empty-filter-message="Nenhuma pessoa encontrada"
              />
              <p
                v-if="localForm.ministryId !== null && peopleForMinistry.length === 0"
                class="description event-form-card__person-hint"
              >
                Nenhuma pessoa vinculada a este ministério.
              </p>
            </label>

            <label>
              Data
              <input
                v-model="localForm.eventDate"
                type="date"
                class="field-control"
              >
            </label>

            <div class="event-form-card__time-row">
              <label>
                Início
                <input
                  v-model="localForm.startTime"
                  type="time"
                  class="field-control"
                  step="1800"
                  @change="handleStartTimeChange"
                >
              </label>

              <label>
                Término
                <input
                  v-model="localForm.endTime"
                  type="time"
                  class="field-control"
                  step="1800"
                  @change="handleEndTimeChange"
                >
              </label>
            </div>

            <label class="event-form-card__duration">
              Duração (minutos)
              <input
                v-model.number="localForm.durationMinutes"
                type="number"
                class="field-control"
                min="15"
                max="720"
                step="15"
                @change="handleDurationChange"
              >
            </label>

            <fieldset v-if="!isEdit" class="event-form-card__recurrence">
              <legend class="event-form-card__recurrence-legend">
                Repetir
              </legend>

              <AppSelectableCard
                v-model="localForm.recurrence.enabled"
                :input-id="`${titleId}-recurrence`"
                title="Repetir semanalmente"
                :description="recurrenceCardDescription"
                @update:model-value="handleRecurrenceToggle"
              >
                <template #icon>
                  <RepeatIcon :size="20" />
                </template>
              </AppSelectableCard>

              <div
                v-if="localForm.recurrence.enabled"
                class="event-form-card__recurrence-hint"
                role="status"
              >
                <span class="event-form-card__recurrence-hint-count">
                  {{ estimatedOccurrenceCount }}
                </span>
                <span class="event-form-card__recurrence-hint-text">
                  eventos serão criados {{ weeklyRepeatPhrase }} até
                  {{ recurrenceYearEndLabel }}.
                </span>
              </div>
            </fieldset>

            <p v-if="formError" class="field-error" role="alert">
              {{ formError }}
            </p>
            </div>

            <div class="event-form-card__actions">
              <button
                v-if="isEdit"
                type="button"
                class="field-button field-button--ghost event-form-card__delete"
                :disabled="loading"
                @click="handleDelete"
              >
                Excluir
              </button>

              <div class="event-form-card__actions-main">
                <button
                  type="button"
                  class="field-button field-button--ghost"
                  data-unsaved-close
                  :disabled="loading"
                  @click="handleCancel"
                >
                  Cancelar
                </button>
                <button type="submit" class="field-button" :disabled="loading">
                  {{ loading ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { ListOrderedIcon, RepeatIcon, XIcon } from '@lucide/vue'
import AppSearchableSelect from '@/components/form/AppSearchableSelect.vue'
import AppSelectableCard from '@/components/form/AppSelectableCard.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { promptUnsavedChanges } from '@/services/unsavedChangesPrompt'
import { unsavedChangesStore } from '@/stores/unsavedChangesStore'
import type { EventFormState, EventType } from '@/types/events'
import type { Ministry, PersonSummary } from '@/types/people'
import {
  addMinutesToTime,
  getDurationMinutes
} from '@/utils/eventCalendar'
import {
  estimateRecurrenceCount,
  weekdayFromDateOnly,
  yearEndFromDateOnly
} from '@/utils/eventRecurrence'

const EVENT_NAME_MAX_LENGTH = 200
const EVENT_DESCRIPTION_MAX_LENGTH = 500

function cloneForm(form: EventFormState): EventFormState {
  return {
    ...form,
    recurrence: {
      enabled: form.recurrence.enabled,
      frequency: 'weekly',
      intervalValue: 1,
      weekdays: [...form.recurrence.weekdays]
    }
  }
}

export default defineComponent({
  name: 'EventFormCard',
  components: {
    AppSearchableSelect,
    AppSelectableCard,
    AppTooltip,
    ListOrderedIcon,
    RepeatIcon,
    XIcon
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    form: {
      type: Object as PropType<EventFormState>,
      required: true
    },
    ministries: {
      type: Array as PropType<Ministry[]>,
      default: () => []
    },
    people: {
      type: Array as PropType<PersonSummary[]>,
      default: () => []
    },
    eventTypes: {
      type: Array as PropType<EventType[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    formError: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'submit', 'delete', 'cancel', 'open-schedule'],
  data() {
    return {
      localForm: cloneForm(this.form),
      nameError: '',
      eventTypeError: '',
      nameMaxLength: EVENT_NAME_MAX_LENGTH,
      descriptionMaxLength: EVENT_DESCRIPTION_MAX_LENGTH,
      titleId: `event-form-title-${Math.random().toString(36).slice(2, 9)}`,
      syncingTimeFields: false,
      bodyCanScroll: false,
      bodyResizeObserver: null as ResizeObserver | null,
      bodyMutationObserver: null as MutationObserver | null
    }
  },
  computed: {
    isEdit(): boolean {
      return this.localForm.id !== null
    },
    selectableEventTypes(): EventType[] {
      return this.eventTypes
    },
    peopleForMinistry(): PersonSummary[] {
      if (this.localForm.ministryId === null) {
        return this.people
      }

      return this.people.filter((person) =>
        (person.ministryIds ?? []).includes(this.localForm.ministryId as number)
      )
    },
    personSelectOptions(): Array<{ value: number; label: string }> {
      return this.peopleForMinistry.map((person) => ({
        value: person.id,
        label: this.formatPersonLabel(person)
      }))
    },
    weeklyRepeatPhrase(): string {
      if (!this.localForm.eventDate) {
        return 'toda semana'
      }

      const weekday = weekdayFromDateOnly(this.localForm.eventDate)
      const phrases: Record<number, string> = {
        0: 'todo domingo',
        1: 'toda segunda-feira',
        2: 'toda terça-feira',
        3: 'toda quarta-feira',
        4: 'toda quinta-feira',
        5: 'toda sexta-feira',
        6: 'todo sábado'
      }

      return phrases[weekday] ?? 'toda semana'
    },
    recurrenceCardDescription(): string {
      return `Mesmo horário, ${this.weeklyRepeatPhrase}, até o fim do ano.`
    },
    estimatedOccurrenceCount(): number {
      return estimateRecurrenceCount(
        this.localForm.eventDate,
        this.localForm.recurrence
      )
    },
    recurrenceYearEndLabel(): string {
      const [year, month, day] = yearEndFromDateOnly(this.localForm.eventDate)
        .split('-')
        .map(Number)
      return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
    }
  },
  watch: {
    form: {
      deep: true,
      handler(value: EventFormState) {
        this.localForm = cloneForm(value)
      }
    },
    modelValue(isOpen: boolean) {
      if (isOpen) {
        this.localForm = cloneForm(this.form)
        this.syncWeeklyFromEventDate()
        this.nameError = ''
        this.eventTypeError = ''
        this.ensureResponsiblePersonIsSelectable()
        this.$nextTick(() => {
          this.bindBodyObservers()
          this.updateBodyScrollState()
        })
        return
      }

      this.teardownBodyObservers()
      this.bodyCanScroll = false
    },
    'localForm.eventDate'() {
      this.syncWeeklyFromEventDate()
    }
  },
  mounted() {
    if (this.modelValue) {
      this.$nextTick(() => {
        this.bindBodyObservers()
        this.updateBodyScrollState()
      })
    }

    window.addEventListener('resize', this.updateBodyScrollState)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateBodyScrollState)
    this.teardownBodyObservers()
  },
  methods: {
    bindBodyObservers(): void {
      this.teardownBodyObservers()

      if (!this.modelValue) {
        return
      }

      const body = this.$refs.modalBody as HTMLElement | undefined

      if (!body) {
        return
      }

      if (typeof ResizeObserver !== 'undefined') {
        this.bodyResizeObserver = new ResizeObserver(() => {
          this.updateBodyScrollState()
        })
        this.bodyResizeObserver.observe(body)

        const container = this.$refs.modalContainer as HTMLElement | undefined

        if (container) {
          this.bodyResizeObserver.observe(container)
        }
      }

      if (typeof MutationObserver !== 'undefined') {
        this.bodyMutationObserver = new MutationObserver(() => {
          this.updateBodyScrollState()
        })
        this.bodyMutationObserver.observe(body, {
          childList: true,
          subtree: true,
          characterData: true
        })
      }
    },
    teardownBodyObservers(): void {
      this.bodyResizeObserver?.disconnect()
      this.bodyResizeObserver = null
      this.bodyMutationObserver?.disconnect()
      this.bodyMutationObserver = null
    },
    updateBodyScrollState(): void {
      if (!this.modelValue) {
        this.bodyCanScroll = false
        return
      }

      const body = this.$refs.modalBody as HTMLElement | undefined
      const container = this.$refs.modalContainer as HTMLElement | undefined

      if (!body || !container) {
        this.bodyCanScroll = false
        return
      }

      const containerStyles = window.getComputedStyle(container)
      const maxHeightValue = containerStyles.maxHeight
      const maxHeight = maxHeightValue.endsWith('px')
        ? Number.parseFloat(maxHeightValue)
        : container.clientHeight

      if (!Number.isFinite(maxHeight) || maxHeight <= 0) {
        this.bodyCanScroll = false
        return
      }

      const title = container.querySelector('.event-form-card__title') as HTMLElement | null
      const actions = container.querySelector('.event-form-card__actions') as HTMLElement | null
      const bodyStyles = window.getComputedStyle(body)
      const actionsStyles = actions ? window.getComputedStyle(actions) : null

      const paddingY =
        Number.parseFloat(containerStyles.paddingTop)
        + Number.parseFloat(containerStyles.paddingBottom)
      const bodyMarginY =
        Number.parseFloat(bodyStyles.marginTop)
        + Number.parseFloat(bodyStyles.marginBottom)
      const actionsMarginY = actionsStyles
        ? Number.parseFloat(actionsStyles.marginTop)
          + Number.parseFloat(actionsStyles.marginBottom)
        : 0

      const chromeHeight =
        paddingY
        + bodyMarginY
        + actionsMarginY
        + (title?.offsetHeight ?? 0)
        + (actions?.offsetHeight ?? 0)

      this.bodyCanScroll = chromeHeight + body.scrollHeight > maxHeight + 2
    },
    formatPersonLabel(person: PersonSummary): string {
      return person.preferredName?.trim() || person.fullName
    },
    handleMinistryChange() {
      this.ensureResponsiblePersonIsSelectable()
    },
    ensureResponsiblePersonIsSelectable() {
      const selectedId = this.localForm.responsiblePersonId

      if (selectedId === null) {
        return
      }

      const isStillSelectable = this.peopleForMinistry.some((person) => person.id === selectedId)

      if (!isStillSelectable) {
        this.localForm.responsiblePersonId = null
      }
    },
    syncWeeklyFromEventDate() {
      this.localForm.recurrence.frequency = 'weekly'
      this.localForm.recurrence.intervalValue = 1

      if (!this.localForm.eventDate) {
        return
      }

      this.localForm.recurrence.weekdays = [
        weekdayFromDateOnly(this.localForm.eventDate)
      ]
    },
    handleRecurrenceToggle(enabled: boolean) {
      this.localForm.recurrence.enabled = enabled
      if (enabled) {
        this.syncWeeklyFromEventDate()
      }
    },
    clearNameError() {
      this.nameError = ''
    },
    clearEventTypeError() {
      this.eventTypeError = ''
    },
    handleStartTimeChange() {
      if (this.syncingTimeFields) {
        return
      }

      this.syncingTimeFields = true
      this.localForm.endTime = addMinutesToTime(
        this.localForm.startTime,
        this.localForm.durationMinutes
      )
      this.syncingTimeFields = false
    },
    handleEndTimeChange() {
      if (this.syncingTimeFields) {
        return
      }

      this.syncingTimeFields = true
      this.localForm.durationMinutes = getDurationMinutes(
        this.localForm.startTime,
        this.localForm.endTime
      )
      this.syncingTimeFields = false
    },
    handleDurationChange() {
      if (this.syncingTimeFields) {
        return
      }

      this.syncingTimeFields = true
      this.localForm.endTime = addMinutesToTime(
        this.localForm.startTime,
        this.localForm.durationMinutes
      )
      this.syncingTimeFields = false
    },
    async handleCancel() {
      const form = this.$refs.eventForm as HTMLFormElement | undefined
      const dirtySources = form ? unsavedChangesStore.getDirtySources(form) : []

      if (dirtySources.length > 0) {
        const choice = await promptUnsavedChanges()

        if (choice === 'confirm') {
          await unsavedChangesStore.save(dirtySources)
          return
        }

        if (choice === 'dismiss') {
          return
        }

        unsavedChangesStore.discard(dirtySources)
      }

      this.$emit('update:modelValue', false)
      this.$emit('cancel')
    },
    handleDelete() {
      this.$emit('delete')
    },
    handleOpenSchedule() {
      if (this.localForm.id === null) {
        return
      }

      this.$emit('open-schedule', this.localForm.id)
    },
    handleSubmit() {
      if (!this.localForm.name.trim()) {
        this.nameError = 'Informe o nome do evento.'
        return
      }

      if (this.localForm.eventTypeId === null || this.localForm.eventTypeId <= 0) {
        this.eventTypeError = 'Selecione o tipo do evento.'
        return
      }

      if (!this.isEdit && this.localForm.recurrence.enabled) {
        this.syncWeeklyFromEventDate()
      }

      this.$emit('submit', cloneForm(this.localForm))
    }
  }
})
</script>

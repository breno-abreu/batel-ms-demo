<template>
  <AppFormModal
    :model-value="modelValue"
    :title="modalTitle"
    :loading="loading"
    :confirm-disabled="!canSubmit"
    confirm-label="Salvar"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="requestFormSubmit"
    @cancel="handleCancel"
      :scrollable-body="true"
    >
    <form
      ref="scheduleItemForm"
      v-unsaved-changes
      class="event-schedule-item-modal"
      @submit.prevent="handleSubmit"
    >
      <label>
        Nome da etapa *
        <input
          v-model="localForm.name"
          type="text"
          class="field-control"
          maxlength="200"
          placeholder="Ex.: Louvor de Abertura"
          :class="{ 'field-control--invalid': nameError }"
          :aria-invalid="nameError ? 'true' : 'false'"
          @input="nameError = ''"
        >
        <span v-if="nameError" class="field-error" role="alert">
          {{ nameError }}
        </span>
      </label>

      <div class="event-schedule-item-modal__responsible-row">
        <label>
          Responsável (cadastro)
          <select
            v-model="localForm.responsiblePersonId"
            class="field-control"
            @change="handlePersonChange"
          >
            <option :value="null">
              Nenhum
            </option>
            <option
              v-for="person in people"
              :key="person.id"
              :value="person.id"
            >
              {{ formatPersonLabel(person) }}
            </option>
          </select>
        </label>

        <div class="event-schedule-item-modal__or">
          <span class="event-schedule-item-modal__or-label" aria-hidden="true">OU</span>
          <AppTooltip
            text="Use o cadastro quando a pessoa já existir no sistema. Use o nome livre quando for alguém externo ou um texto descritivo (ex.: visitante, convidado)."
            position="top"
          >
            <button
              type="button"
              class="event-schedule-item-modal__or-help"
              aria-label="Por que há dois campos de responsável?"
            >
              <CircleQuestionMarkIcon :size="14" aria-hidden="true" />
            </button>
          </AppTooltip>
        </div>

        <label>
          Responsável (nome livre)
          <input
            v-model="localForm.responsibleAltName"
            type="text"
            class="field-control"
            maxlength="200"
            placeholder="Ex.: Bruno Benetti"
            @input="handleAltNameInput"
          >
        </label>
      </div>

      <div class="event-schedule-item-modal__time-row">
        <label>
          Início
          <input
            v-model="localForm.startTime"
            type="time"
            class="field-control"
            step="60"
          >
        </label>

        <label>
          Duração (minutos)
          <input
            v-model.number="localForm.durationMinutes"
            type="number"
            class="field-control"
            min="1"
            max="1440"
            step="1"
            placeholder="Ex.: 5"
          >
        </label>
      </div>

      <label>
        Detalhes/Convidado/Execução
        <textarea
          v-model="localForm.notes"
          class="field-control"
          rows="3"
          placeholder="Observações opcionais"
        />
      </label>

      <p v-if="formError" class="field-error" role="alert">
        {{ formError }}
      </p>
    </form>

    <template
      v-if="isEdit"
      #actions-start
    >
      <button
        type="button"
        class="field-button field-button--ghost event-schedule-item-modal__delete"
        :disabled="loading"
        @click="handleDelete"
      >
        Excluir etapa
      </button>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { CircleQuestionMarkIcon } from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import type { EventScheduleFormState } from '@/types/eventSchedule'
import type { PersonSummary } from '@/types/people'

export default defineComponent({
  name: 'EventScheduleItemModal',
  components: {
    AppFormModal,
    AppTooltip,
    CircleQuestionMarkIcon
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    form: {
      type: Object as PropType<EventScheduleFormState>,
      required: true
    },
    people: {
      type: Array as PropType<PersonSummary[]>,
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
  emits: ['update:modelValue', 'submit', 'delete', 'cancel'],
  data() {
    return {
      localForm: { ...this.form } as EventScheduleFormState,
      nameError: ''
    }
  },
  computed: {
    isEdit(): boolean {
      return this.localForm.id !== null
    },
    modalTitle(): string {
      return this.isEdit ? 'Editar etapa' : 'Nova etapa'
    },
    canSubmit(): boolean {
      return this.localForm.name.trim().length > 0
    }
  },
  watch: {
    form: {
      deep: true,
      handler(value: EventScheduleFormState) {
        this.localForm = { ...value }
      }
    },
    modelValue(isOpen: boolean) {
      if (isOpen) {
        this.localForm = { ...this.form }
        this.nameError = ''
      }
    }
  },
  methods: {
    formatPersonLabel(person: PersonSummary): string {
      return person.preferredName?.trim() || person.fullName
    },
    handlePersonChange() {
      if (this.localForm.responsiblePersonId !== null) {
        this.localForm.responsibleAltName = ''
      }
    },
    handleAltNameInput() {
      if (this.localForm.responsibleAltName.trim()) {
        this.localForm.responsiblePersonId = null
      }
    },
    handleCancel() {
      this.$emit('update:modelValue', false)
      this.$emit('cancel')
    },
    handleDelete() {
      this.$emit('delete')
    },
    requestFormSubmit() {
      const form = this.$refs.scheduleItemForm as HTMLFormElement | undefined
      form?.requestSubmit()
    },
    handleSubmit() {
      if (!this.localForm.name.trim()) {
        this.nameError = 'Informe o nome da etapa.'
        return
      }

      this.$emit('submit', { ...this.localForm })
    }
  }
})
</script>

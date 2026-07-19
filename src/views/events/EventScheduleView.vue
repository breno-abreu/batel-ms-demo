<template>
  <section class="repertoire-page event-schedule-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <ListOrderedIcon :size="20" />
          </span>
          <h1>Cronograma do evento</h1>
        </div>
        <p class="description repertoire-page__header-description">
          {{ headerDescription }}
        </p>
      </div>

      <div class="repertoire-page__header-actions">
        <button
          v-if="canManageSchedule"
          type="button"
          class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
          :disabled="shareLinkLoading || listLoading"
          @click="handleCopyShareLink"
        >
          <LinkIcon :size="16" aria-hidden="true" />
          {{ shareLinkLoading ? 'Gerando link...' : 'Copiar link público' }}
        </button>

        <RouterLink
          class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
          :to="{ name: 'events-agenda' }"
        >
          <ArrowLeftIcon :size="16" aria-hidden="true" />
          Voltar à agenda
        </RouterLink>
      </div>
    </header>

    <AppListSkeleton
      v-if="listLoading"
      :rows="4"
      :action-count="1"
    />

    <template v-else>
      <section v-if="canManageSchedule" class="event-schedule-template-bar fluent-card">
        <div class="event-schedule-template-bar__field">
          <label for="event-schedule-template-select">
            Template de cronograma
          </label>
          <select
            id="event-schedule-template-select"
            v-model="selectedTemplateId"
            class="field-control"
            :disabled="templateLoading || applyTemplateLoading"
          >
            <option :value="null">
              Selecione um template...
            </option>
            <option
              v-for="template in templates"
              :key="template.id"
              :value="template.id"
            >
              {{ template.name }} ({{ template.itemCount }} {{ template.itemCount === 1 ? 'etapa' : 'etapas' }})
            </option>
          </select>
        </div>

        <div class="event-schedule-template-bar__actions">
          <button
            type="button"
            class="field-button"
            :disabled="selectedTemplateId === null || applyTemplateLoading || templateLoading"
            @click="handleApplyTemplate"
          >
            {{ applyTemplateLoading ? 'Aplicando...' : 'Aplicar template' }}
          </button>
          <button
            type="button"
            class="field-button field-button--ghost"
            :disabled="items.length === 0 || saveTemplateLoading"
            @click="openSaveTemplateModal"
          >
            Salvar como template
          </button>
        </div>
      </section>

      <section class="event-schedule-timeline fluent-card">
        <div
          v-if="items.length === 0"
          class="event-schedule-timeline__empty"
        >
          <p class="description">
            {{ canManageSchedule
              ? 'Nenhuma etapa no cronograma. Clique no botão abaixo para começar ou aplique um template.'
              : 'Nenhuma etapa cadastrada no cronograma.' }}
          </p>
          <button
            v-if="canManageSchedule"
            type="button"
            class="event-schedule-timeline__add-button"
            aria-label="Adicionar etapa"
            @click="openCreateModal()"
          >
            <PlusIcon :size="28" aria-hidden="true" />
          </button>
        </div>

        <template v-else>
          <ul class="event-schedule-timeline__list" aria-label="Etapas do cronograma">
            <li
              v-for="(item, index) in items"
              :key="item.id"
              class="event-schedule-timeline__entry"
            >
              <div class="event-schedule-timeline__row">
                <div class="event-schedule-timeline__card-wrap">
                  <article
                    class="event-schedule-timeline__item"
                    :class="{
                      'event-schedule-timeline__item--live': isLiveStage(index)
                    }"
                    :style="getItemHeightStyle(item.durationMinutes)"
                  >
                    <div
                      v-if="isLiveStage(index) && nowLineStyle(index)"
                      class="event-schedule-timeline__now-line"
                      :style="nowLineStyle(index)!"
                      aria-hidden="true"
                    >
                      <span class="event-schedule-timeline__now-dot" />
                    </div>

                    <button
                      type="button"
                      class="event-schedule-timeline__main"
                      @click="openEditModal(item)"
                    >
                      <div class="event-schedule-timeline__content">
                        <h2 class="event-schedule-timeline__name">
                          {{ item.name }}
                        </h2>
                        <p
                          v-if="item.responsibleDisplayName"
                          class="event-schedule-timeline__responsible"
                        >
                          <span class="event-schedule-timeline__label">Responsável:</span>
                          {{ item.responsibleDisplayName }}
                        </p>
                        <p
                          v-if="item.notes"
                          class="event-schedule-timeline__notes"
                        >
                          <span class="event-schedule-timeline__label">Detalhes/Convidado/Execução:</span>
                          {{ item.notes }}
                        </p>
                      </div>

                      <div class="event-schedule-timeline__time">
                        <span class="event-schedule-timeline__start">
                          {{ formatStartTime(item.startTime) }}
                        </span>
                        <span
                          v-if="item.durationMinutes"
                          class="event-schedule-timeline__duration"
                        >
                          {{ item.durationMinutes }} min
                        </span>
                      </div>
                    </button>
                  </article>

                  <div v-if="canManageSchedule" class="event-schedule-timeline__inserter">
                    <button
                      type="button"
                      class="event-schedule-timeline__add-button event-schedule-timeline__add-button--inline"
                      :aria-label="inserterLabel(index)"
                      @click="openCreateModal(index)"
                    >
                      <PlusIcon :size="16" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <AppTooltip v-if="canManageSchedule" text="Excluir etapa">
                  <button
                    type="button"
                    class="event-schedule-timeline__remove"
                    :aria-label="`Excluir ${item.name}`"
                    @click="handleDeleteItem(item)"
                  >
                    <Trash2Icon :size="14" aria-hidden="true" />
                  </button>
                </AppTooltip>
              </div>
            </li>
          </ul>
        </template>
      </section>
    </template>

    <EventScheduleItemModal
      v-model="formOpen"
      :form="form"
      :people="people"
      :loading="formLoading"
      :form-error="formError"
      @submit="handleFormSubmit"
      @delete="handleFormDelete"
      @cancel="closeForm"
    />

    <AppFormModal
      v-model="saveTemplateModalOpen"
      title="Salvar como template"
      confirm-label="Salvar template"
      :loading="saveTemplateLoading"
      :confirm-disabled="!saveTemplateName.trim()"
      @confirm="requestSaveTemplateSubmit"
      @cancel="closeSaveTemplateModal"
    >
      <form
        ref="saveTemplateForm"
        v-unsaved-changes
        class="event-schedule-save-template-modal"
        @submit.prevent="handleSaveTemplate"
      >
        <label>
          Nome do template
          <input
            v-model="saveTemplateName"
            type="text"
            class="field-control"
            maxlength="200"
            placeholder="Ex.: Culto padrão de sábado"
          >
        </label>
        <label>
          Descrição
          <textarea
            v-model="saveTemplateDescription"
            class="field-control"
            rows="3"
            placeholder="Descrição opcional"
          />
        </label>
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeftIcon, LinkIcon, ListOrderedIcon, PlusIcon, Trash2Icon } from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import {
  buildPublicEventScheduleShareUrl,
  eventScheduleService
} from '@/services/eventScheduleService'
import { eventScheduleTemplateService } from '@/services/eventScheduleTemplateService'
import { personService } from '@/services/personService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type {
  CreateEventScheduleRequest,
  EventScheduleFormState,
  EventScheduleItem,
  EventSchedulePage
} from '@/types/eventSchedule'
import type { EventScheduleTemplateListItem } from '@/types/eventScheduleTemplate'
import type { PersonSummary } from '@/types/people'
import { Permissions } from '@/utils/permissions'
import {
  getActiveScheduleNowIndicator,
  getScheduleItemHeightStyle,
  isEventHappeningNow,
  parseScheduleTimeToMinutes
} from '@/utils/eventScheduleTimeline'
import EventScheduleItemModal from '@/views/events/components/EventScheduleItemModal.vue'

function createEmptyForm(startTime = ''): EventScheduleFormState {
  return {
    id: null,
    name: '',
    responsiblePersonId: null,
    responsibleAltName: '',
    startTime,
    durationMinutes: null,
    notes: ''
  }
}

function minutesToTimeInput(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function formatDateLabel(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return value
  }

  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export default defineComponent({
  name: 'EventScheduleView',
  components: {
    AppFormModal,
    AppListSkeleton,
    AppTooltip,
    ArrowLeftIcon,
    EventScheduleItemModal,
    LinkIcon,
    ListOrderedIcon,
    PlusIcon,
    RouterLink,
    Trash2Icon
  },
  data() {
    return {
      listLoading: true,
      page: null as EventSchedulePage | null,
      people: [] as PersonSummary[],
      formOpen: false,
      formLoading: false,
      formError: '',
      form: createEmptyForm(),
      insertAfterIndex: null as number | null,
      shareLinkLoading: false,
      now: new Date(),
      nowTimer: null as ReturnType<typeof setInterval> | null,
      templates: [] as EventScheduleTemplateListItem[],
      selectedTemplateId: null as number | null,
      templateLoading: false,
      applyTemplateLoading: false,
      saveTemplateModalOpen: false,
      saveTemplateLoading: false,
      saveTemplateName: '',
      saveTemplateDescription: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageSchedule(): boolean {
      return this.authStore.hasPermission(Permissions.EventSchedulesManage)
    },
    eventId(): number {
      return Number(this.$route.params.eventId)
    },
    items(): EventScheduleItem[] {
      return this.page?.items ?? []
    },
    isEventLive(): boolean {
      if (!this.page) {
        return false
      }

      return isEventHappeningNow(
        this.page.eventDate,
        this.page.eventStartTime,
        this.page.eventEndTime,
        this.items,
        this.now
      )
    },
    activeNowIndicator() {
      if (!this.isEventLive) {
        return null
      }

      return getActiveScheduleNowIndicator(
        this.items,
        this.page?.eventEndTime ?? null,
        this.now
      )
    },
    headerDescription(): string {
      if (!this.page) {
        return 'Defina as etapas do culto ou atividade.'
      }

      const dateLabel = formatDateLabel(this.page.eventDate)
      const start = this.formatStartTime(this.page.eventStartTime)
      return `${this.page.eventName} · ${dateLabel}${start !== '—' ? ` · ${start}` : ''}`
    }
  },
  watch: {
    eventId: {
      immediate: true,
      handler() {
        void this.loadPage()
      }
    }
  },
  async created() {
    await Promise.all([
      this.loadPeople(),
      this.loadTemplates()
    ])
  },
  mounted() {
    this.nowTimer = setInterval(() => {
      this.now = new Date()
    }, 30_000)
  },
  beforeUnmount() {
    if (this.nowTimer) {
      clearInterval(this.nowTimer)
      this.nowTimer = null
    }
  },
  methods: {
    isLiveStage(index: number): boolean {
      return this.activeNowIndicator?.itemIndex === index
    },
    nowLineStyle(index: number): { top: string } | null {
      if (!this.activeNowIndicator || this.activeNowIndicator.itemIndex !== index) {
        return null
      }

      const progress = Math.min(0.98, Math.max(0.02, this.activeNowIndicator.progress))
      return { top: `${progress * 100}%` }
    },
    getItemHeightStyle(durationMinutes: number | null | undefined) {
      return getScheduleItemHeightStyle(durationMinutes)
    },
    formatStartTime(value: string | null | undefined): string {
      if (!value) {
        return '—'
      }

      return value.length >= 5 ? value.slice(0, 5) : value
    },
    async loadTemplates() {
      this.templateLoading = true

      try {
        const response = await eventScheduleTemplateService.list()
        this.templates = response.payload ?? []
      } catch {
        this.templates = []
        toastService.error('Não foi possível carregar os templates de cronograma.')
      } finally {
        this.templateLoading = false
      }
    },
    async handleApplyTemplate() {
      if (this.selectedTemplateId === null) {
        return
      }

      const selectedTemplate = this.templates.find(
        (template) => template.id === this.selectedTemplateId
      )

      if (this.items.length > 0) {
        const confirmed = await confirmDialogService.confirm({
          title: 'Aplicar template',
          message: selectedTemplate
            ? `As etapas atuais serão substituídas pelo template "${selectedTemplate.name}". Deseja continuar?`
            : 'As etapas atuais serão substituídas pelo template selecionado. Deseja continuar?',
          confirmLabel: 'Aplicar',
          cancelLabel: 'Cancelar',
          tone: 'danger'
        })

        if (!confirmed) {
          return
        }
      }

      this.applyTemplateLoading = true

      try {
        const response = await eventScheduleTemplateService.applyToEvent(
          this.selectedTemplateId,
          this.eventId
        )

        if (!response.payload) {
          throw new Error('Não foi possível aplicar o template.')
        }

        this.page = response.payload
        toastService.success(response.message || 'Template aplicado ao cronograma.')
      } catch (error) {
        toastService.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível aplicar o template.'
        )
      } finally {
        this.applyTemplateLoading = false
      }
    },
    openSaveTemplateModal() {
      this.saveTemplateName = this.page?.eventName
        ? `Template — ${this.page.eventName}`
        : ''
      this.saveTemplateDescription = ''
      this.saveTemplateModalOpen = true
    },
    closeSaveTemplateModal() {
      this.saveTemplateModalOpen = false
      this.saveTemplateName = ''
      this.saveTemplateDescription = ''
    },
    requestSaveTemplateSubmit() {
      const form = this.$refs.saveTemplateForm as HTMLFormElement | undefined
      form?.requestSubmit()
    },
    async handleSaveTemplate() {
      if (!this.saveTemplateName.trim()) {
        return
      }

      this.saveTemplateLoading = true

      try {
        const response = await eventScheduleTemplateService.createFromEvent(this.eventId, {
          name: this.saveTemplateName.trim(),
          description: this.saveTemplateDescription.trim() || null
        })

        toastService.success(response.message || 'Template salvo com sucesso.')
        this.closeSaveTemplateModal()
        await this.loadTemplates()

        if (response.payload?.id) {
          this.selectedTemplateId = response.payload.id
        }
      } catch (error) {
        toastService.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar o template.'
        )
      } finally {
        this.saveTemplateLoading = false
      }
    },
    inserterLabel(index: number): string {
      if (index >= this.items.length - 1) {
        return 'Adicionar etapa ao final'
      }

      return 'Adicionar etapa entre as existentes'
    },
    suggestStartTime(insertAfterIndex: number | null): string {
      if (this.items.length === 0) {
        return this.formatStartTime(this.page?.eventStartTime) === '—'
          ? '09:00'
          : this.formatStartTime(this.page?.eventStartTime)
      }

      if (insertAfterIndex === null) {
        return this.page?.eventStartTime
          ? this.formatStartTime(this.page.eventStartTime)
          : '09:00'
      }

      const previous = this.items[insertAfterIndex]
      const next = this.items[insertAfterIndex + 1]
      const previousStart = parseScheduleTimeToMinutes(previous?.startTime)
      const previousDuration = previous?.durationMinutes ?? 5
      const previousEnd = previousStart !== null ? previousStart + previousDuration : null
      const nextStart = parseScheduleTimeToMinutes(next?.startTime)

      if (previousEnd !== null && nextStart !== null && nextStart > previousEnd) {
        return minutesToTimeInput(Math.floor((previousEnd + nextStart) / 2))
      }

      if (previousEnd !== null) {
        return minutesToTimeInput(previousEnd)
      }

      return previous?.startTime
        ? this.formatStartTime(previous.startTime)
        : '09:00'
    },
    openCreateModal(insertAfterIndex: number | null = null) {
      if (!this.canManageSchedule) {
        return
      }

      this.insertAfterIndex = insertAfterIndex
      this.formError = ''
      this.form = createEmptyForm(this.suggestStartTime(insertAfterIndex))
      this.formOpen = true
    },
    openEditModal(item: EventScheduleItem) {
      if (!this.canManageSchedule) {
        return
      }

      this.insertAfterIndex = null
      this.formError = ''
      this.form = {
        id: item.id,
        name: item.name,
        responsiblePersonId: item.responsiblePersonId,
        responsibleAltName: item.responsibleAltName ?? '',
        startTime: item.startTime ? this.formatStartTime(item.startTime) : '',
        durationMinutes: item.durationMinutes,
        notes: item.notes ?? ''
      }
      this.formOpen = true
    },
    closeForm() {
      this.formOpen = false
      this.formError = ''
      this.insertAfterIndex = null
    },
    buildPayload(form: EventScheduleFormState): CreateEventScheduleRequest {
      const duration = form.durationMinutes
      const validDuration = typeof duration === 'number'
        && Number.isFinite(duration)
        && duration > 0
        ? Math.round(duration)
        : null

      return {
        name: form.name.trim(),
        responsiblePersonId: form.responsiblePersonId,
        responsibleAltName: form.responsibleAltName.trim() || null,
        startTime: form.startTime ? `${form.startTime}:00` : null,
        durationMinutes: validDuration,
        notes: form.notes.trim() || null
      }
    },
    async loadPeople() {
      try {
        const response = await personService.listForSelection()
        this.people = response.payload ?? []
      } catch {
        this.people = []
      }
    },
    async handleCopyShareLink() {
      if (!this.canManageSchedule || !Number.isFinite(this.eventId) || this.eventId <= 0) {
        return
      }

      this.shareLinkLoading = true

      try {
        const response = await eventScheduleService.generateShareLink(this.eventId)
        const shareHash = response.payload?.shareHash

        if (!shareHash) {
          throw new Error('Não foi possível gerar o link de compartilhamento.')
        }

        if (this.page) {
          this.page = {
            ...this.page,
            publicShareHash: shareHash
          }
        }

        await navigator.clipboard.writeText(buildPublicEventScheduleShareUrl(shareHash))
        toastService.success('Link público copiado para a área de transferência.')
      } catch (error) {
        toastService.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível copiar o link público.'
        )
      } finally {
        this.shareLinkLoading = false
      }
    },
    async loadPage() {
      if (!Number.isFinite(this.eventId) || this.eventId <= 0) {
        void this.$router.replace({ name: 'not-found' })
        return
      }

      this.listLoading = true

      try {
        const response = await eventScheduleService.listByEvent(this.eventId)
        this.page = response.payload
      } catch {
        toastService.error('Não foi possível carregar o cronograma do evento.')
        void this.$router.replace({ name: 'events-agenda' })
      } finally {
        this.listLoading = false
      }
    },
    async handleFormSubmit(form: EventScheduleFormState) {
      this.formLoading = true
      this.formError = ''

      try {
        const payload = this.buildPayload(form)

        if (form.id === null) {
          await eventScheduleService.create(this.eventId, payload)
          toastService.success('Etapa adicionada ao cronograma.')
        } else {
          await eventScheduleService.update(form.id, payload)
          toastService.success('Etapa atualizada.')
        }

        this.closeForm()
        await this.loadPage()
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'Não foi possível salvar a etapa.'
        this.formError = message
      } finally {
        this.formLoading = false
      }
    },
    async handleFormDelete() {
      if (this.form.id === null) {
        return
      }

      await this.deleteItemById(this.form.id, this.form.name)
    },
    async handleDeleteItem(item: EventScheduleItem) {
      await this.deleteItemById(item.id, item.name)
    },
    async deleteItemById(id: number, name: string) {
      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir etapa',
        message: `Deseja excluir "${name}" do cronograma?`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.formLoading = true
      this.formError = ''

      try {
        await eventScheduleService.remove(id)
        toastService.success('Etapa excluída.')
        this.closeForm()
        await this.loadPage()
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'Não foi possível excluir a etapa.'
        this.formError = message
        toastService.error(message)
      } finally {
        this.formLoading = false
      }
    }
  }
})
</script>

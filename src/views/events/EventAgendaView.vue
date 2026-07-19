<template>
  <section class="repertoire-page event-agenda-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <CalendarIcon :size="20" />
          </span>
          <h1>Agenda</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Visualização semanal dos eventos. Clique em um horário para criar ou em um evento para editar.
        </p>
      </div>

      <div class="event-agenda-page__toolbar">
        <button
          type="button"
          class="field-button field-button--ghost"
          @click="goToToday"
        >
          Hoje
        </button>

        <div class="event-agenda-page__week-nav">
          <button
            type="button"
            class="event-agenda-page__nav-button"
            aria-label="Semana anterior"
            @click="goToPreviousWeek"
          >
            <ChevronLeftIcon :size="18" aria-hidden="true" />
          </button>
          <span class="event-agenda-page__week-label">{{ weekRangeLabel }}</span>
          <button
            type="button"
            class="event-agenda-page__nav-button"
            aria-label="Próxima semana"
            @click="goToNextWeek"
          >
            <ChevronRightIcon :size="18" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

    <section class="event-agenda fluent-card">
      <div class="event-agenda__scroll">
        <div class="event-agenda__grid">
          <div class="event-agenda__corner" aria-hidden="true">
            GMT-03
          </div>

          <div
            v-for="(day, dayIndex) in weekDays"
            :key="formatDateOnly(day)"
            class="event-agenda__day-header"
            :class="{ 'event-agenda__day-header--today': isToday(day) }"
          >
            <span class="event-agenda__weekday">{{ weekdayLabels[dayIndex] }}</span>
            <span
              class="event-agenda__day-number"
              :class="{ 'event-agenda__day-number--today': isToday(day) }"
            >
              {{ day.getDate() }}
            </span>
          </div>

          <div class="event-agenda__time-column">
            <div
              v-for="hour in agendaHours"
              :key="hour"
              class="event-agenda__time-label"
              :style="{ height: `${hourHeightPx}px` }"
            >
              {{ formatHourLabel(hour) }}
            </div>
          </div>

          <div
            v-for="day in weekDays"
            :key="`column-${formatDateOnly(day)}`"
            class="event-agenda__day-column"
          >
            <div
              class="event-agenda__day-body"
              :style="{ height: `${gridHeightPx}px` }"
              @click="handleGridClick(day, $event)"
            >
              <div
                v-for="hour in agendaHours"
                :key="hour"
                class="event-agenda__hour-line"
                :style="{ height: `${hourHeightPx}px` }"
              />

              <div
                v-if="isToday(day) && currentTimeStyle"
                class="event-agenda__now-line"
                :style="currentTimeStyle"
                aria-hidden="true"
              >
                <span class="event-agenda__now-dot" />
              </div>

              <button
                v-for="eventItem in eventsForDay(day)"
                :key="eventItem.id"
                type="button"
                class="event-agenda__event"
                :class="{ 'event-agenda__event--previewed': previewEvent?.id === eventItem.id }"
                :style="getEventStyle(eventItem)"
                @click.stop="handleEventClick(eventItem, $event)"
                @mouseenter="showEventPreview(eventItem, $event)"
                @mouseleave="scheduleHideEventPreview"
              >
                <span class="event-agenda__event-title">{{ eventItem.name }}</span>
                <span class="event-agenda__event-time">
                  {{ formatEventTime(eventItem.startTime, eventItem.endTime) }}
                </span>
                <span
                  v-if="eventItem.ministryName"
                  class="event-agenda__event-meta"
                >
                  {{ eventItem.ministryName }}
                </span>
                <span
                  v-if="eventItem.eventTypeName"
                  class="event-agenda__event-meta"
                >
                  {{ eventItem.eventTypeName }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <EventFormCard
      v-model="formOpen"
      :form="form"
      :ministries="ministries"
      :people="people"
      :event-types="eventTypes"
      :loading="formLoading"
      :form-error="formError"
      @submit="handleFormSubmit"
      @delete="handleFormDelete"
      @cancel="closeForm"
      @open-schedule="handleOpenSchedule"
    />

    <EventSeriesScopeModal
      v-model="seriesScopeOpen"
      :title="seriesScopeTitle"
      :message="seriesScopeMessage"
      :confirm-label="seriesScopeConfirmLabel"
      :tone="seriesScopeTone"
      @confirm="handleSeriesScopeConfirm"
      @cancel="handleSeriesScopeCancel"
    />

    <Teleport to="body">
      <Transition name="event-agenda-preview">
        <article
          v-if="previewEvent"
          :key="previewEvent.id"
          class="event-agenda__event-preview fluent-card"
          :class="previewPlacementClass"
          :style="previewStyle"
          @mouseenter="cancelHideEventPreview"
          @mouseleave="scheduleHideEventPreview"
        >
        <h3 class="event-agenda__event-preview-title">
          {{ previewEvent.name }}
        </h3>

        <p
          v-if="previewEvent.description"
          class="event-agenda__event-preview-description"
        >
          {{ previewEvent.description }}
        </p>
        <p
          v-else
          class="event-agenda__event-preview-description event-agenda__event-preview-description--empty"
        >
          Sem descrição
        </p>

        <dl class="event-agenda__event-preview-list">
          <div class="event-agenda__event-preview-item">
            <dt>Tipo</dt>
            <dd>{{ previewEvent.eventTypeName || '—' }}</dd>
          </div>
          <div class="event-agenda__event-preview-item">
            <dt>Ministério</dt>
            <dd>{{ previewEvent.ministryName || '—' }}</dd>
          </div>
          <div class="event-agenda__event-preview-item">
            <dt>Responsável</dt>
            <dd>{{ previewEvent.responsiblePersonName || '—' }}</dd>
          </div>
        </dl>

        <div class="event-agenda__event-preview-actions">
          <button
            type="button"
            class="field-button field-button--sm event-agenda__event-preview-action"
            :disabled="shareLinkLoadingEventId === previewEvent.id"
            @click.stop="handleCopyPreviewShareLink(previewEvent.id)"
          >
            <LinkIcon :size="14" aria-hidden="true" />
            {{ shareLinkLoadingEventId === previewEvent.id ? 'Copiando...' : 'Copiar link' }}
          </button>
          <button
            type="button"
            class="field-button field-button--sm event-agenda__event-preview-action"
            @click.stop="handleOpenSchedule(previewEvent.id)"
          >
            <ListOrderedIcon :size="14" aria-hidden="true" />
            Acessar cronograma
          </button>
        </div>
        </article>
      </Transition>
    </Teleport>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LinkIcon,
  ListOrderedIcon
} from '@lucide/vue'
import EventFormCard from '@/views/events/components/EventFormCard.vue'
import EventSeriesScopeModal from '@/views/events/components/EventSeriesScopeModal.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import {
  buildPublicEventScheduleShareUrl,
  eventScheduleService
} from '@/services/eventScheduleService'
import { eventService } from '@/services/eventService'
import { eventTypeService } from '@/services/eventTypeService'
import { ministryService } from '@/services/ministryService'
import { personService } from '@/services/personService'
import { toastService } from '@/services/toastService'
import type {
  CreateEventRequest,
  EventCalendarItem,
  EventFormState,
  EventType,
  SeriesEditScope,
  UpdateEventRequest
} from '@/types/events'
import type { Ministry, PersonSummary } from '@/types/people'
import {
  createEmptyRecurrenceForm,
  toRecurrenceRequest
} from '@/utils/eventRecurrence'
import {
  AGENDA_END_HOUR,
  AGENDA_HOUR_HEIGHT_PX,
  AGENDA_START_HOUR,
  addDays,
  addMinutesToTime,
  formatDateOnly,
  formatEventTimeLabel,
  formatHourLabel,
  formatWeekRangeLabel,
  getAgendaHours,
  getCurrentTimeIndicatorStyle,
  getEventBlockStyle,
  getTimeFromGridOffset,
  getWeekDays,
  isToday,
  minutesToTimeInputValue,
  startOfWeek,
  WEEKDAY_LABELS
} from '@/utils/eventCalendar'

function createEmptyForm(): EventFormState {
  const today = formatDateOnly(new Date())

  return {
    id: null,
    seriesId: null,
    name: '',
    description: '',
    eventTypeId: null,
    ministryId: null,
    responsiblePersonId: null,
    eventDate: today,
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    recurrence: createEmptyRecurrenceForm(today)
  }
}

export default defineComponent({
  name: 'EventAgendaView',
  components: {
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EventFormCard,
    EventSeriesScopeModal,
    LinkIcon,
    ListOrderedIcon
  },
  data() {
    return {
      weekStart: startOfWeek(new Date()),
      events: [] as EventCalendarItem[],
      ministries: [] as Ministry[],
      people: [] as PersonSummary[],
      eventTypes: [] as EventType[],
      formOpen: false,
      formLoading: false,
      formError: '',
      form: createEmptyForm(),
      weekdayLabels: WEEKDAY_LABELS,
      agendaHours: getAgendaHours(),
      hourHeightPx: AGENDA_HOUR_HEIGHT_PX,
      now: new Date(),
      nowTimer: null as ReturnType<typeof setInterval> | null,
      previewEvent: null as EventCalendarItem | null,
      previewStyle: {} as Record<string, string>,
      previewPlacement: 'right' as 'left' | 'right',
      previewHideTimer: null as ReturnType<typeof setTimeout> | null,
      shareLinkLoadingEventId: null as number | null,
      seriesScopeOpen: false,
      seriesScopeMode: null as 'update' | 'delete' | null,
      seriesScopePendingForm: null as EventFormState | null,
      seriesScopeTitle: '',
      seriesScopeMessage: '',
      seriesScopeConfirmLabel: 'Confirmar',
      seriesScopeTone: 'info' as 'danger' | 'info'
    }
  },
  computed: {
    canManageAgenda(): boolean {
      return true
    },
    weekDays(): Date[] {
      return getWeekDays(this.weekStart)
    },
    weekRangeLabel(): string {
      return formatWeekRangeLabel(this.weekStart)
    },
    weekEndDate(): string {
      return formatDateOnly(addDays(this.weekStart, 6))
    },
    weekStartDate(): string {
      return formatDateOnly(this.weekStart)
    },
    gridHeightPx(): number {
      return (AGENDA_END_HOUR - AGENDA_START_HOUR + 1) * AGENDA_HOUR_HEIGHT_PX
    },
    currentTimeStyle(): { top: string } | null {
      return getCurrentTimeIndicatorStyle(this.now)
    },
    previewPlacementClass(): string {
      return this.previewPlacement === 'left'
        ? 'event-agenda__event-preview--from-left'
        : 'event-agenda__event-preview--from-right'
    }
  },
  async mounted() {
    this.nowTimer = setInterval(() => {
      this.now = new Date()
    }, 60_000)

    await Promise.all([
      this.loadReferenceData(),
      this.loadEvents()
    ])
  },
  beforeUnmount() {
    if (this.nowTimer) {
      clearInterval(this.nowTimer)
    }

    this.cancelHideEventPreview()
    this.previewEvent = null
  },
  watch: {
    weekStart() {
      this.previewEvent = null
      void this.loadEvents()
    },
    formOpen(isOpen: boolean) {
      if (isOpen) {
        this.previewEvent = null
      }
    }
  },
  methods: {
    formatDateOnly,
    formatHourLabel,
    isToday,
    formatEventTime(startTime: string | null, endTime: string | null): string {
      return formatEventTimeLabel(startTime, endTime)
    },
    getEventStyle(eventItem: EventCalendarItem) {
      return getEventBlockStyle(eventItem.startTime, eventItem.endTime)
    },
    eventsForDay(day: Date): EventCalendarItem[] {
      const dateKey = formatDateOnly(day)

      return this.events.filter((item) => item.eventDate === dateKey)
    },
    async loadReferenceData() {
      try {
        const [ministriesResponse, peopleResponse, eventTypesResponse] = await Promise.all([
          ministryService.list(),
          personService.listForSelection(),
          eventTypeService.list()
        ])

        this.ministries = (ministriesResponse.payload ?? []).filter((item) => item.isActive)
        this.people = peopleResponse.payload ?? []
        this.eventTypes = eventTypesResponse.payload ?? []
      } catch {
        this.ministries = []
        this.people = []
        this.eventTypes = []
      }
    },
    async loadEvents() {
      try {
        const response = await eventService.listByDateRange(
          this.weekStartDate,
          this.weekEndDate
        )
        this.events = (response.payload ?? []).map((item) => ({
          ...item,
          seriesId: item.seriesId ?? null
        }))
      } catch {
        this.events = []
      }
    },
    goToPreviousWeek() {
      this.weekStart = addDays(this.weekStart, -7)
    },
    goToNextWeek() {
      this.weekStart = addDays(this.weekStart, 7)
    },
    goToToday() {
      this.weekStart = startOfWeek(new Date())
    },
    openFormForSlot(day: Date, clickEvent: MouseEvent, preset?: EventCalendarItem) {
      if (!this.canManageAgenda) {
        return
      }

      const target = clickEvent.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const offsetY = clickEvent.clientY - rect.top
      const { hour, minute } = getTimeFromGridOffset(offsetY)
      const startTime = minutesToTimeInputValue(hour * 60 + minute)
      const endTime = addMinutesToTime(startTime, 60)

      this.form = preset
        ? this.mapEventToForm(preset)
        : {
          ...createEmptyForm(),
          eventDate: formatDateOnly(day),
          startTime,
          endTime,
          durationMinutes: 60,
          recurrence: createEmptyRecurrenceForm(formatDateOnly(day))
        }

      this.formError = ''
      this.formOpen = true
    },
    mapEventToForm(eventItem: EventCalendarItem): EventFormState {
      const startTime = eventItem.startTime?.slice(0, 5) ?? '09:00'
      const endTime = eventItem.endTime?.slice(0, 5) ?? addMinutesToTime(startTime, 60)

      return {
        id: eventItem.id,
        seriesId: eventItem.seriesId ?? null,
        name: eventItem.name,
        description: eventItem.description ?? '',
        eventTypeId: eventItem.eventTypeId,
        ministryId: eventItem.ministryId,
        responsiblePersonId: eventItem.responsiblePersonId,
        eventDate: eventItem.eventDate,
        startTime,
        endTime,
        durationMinutes: this.getDurationFromTimes(startTime, endTime),
        recurrence: createEmptyRecurrenceForm(eventItem.eventDate)
      }
    },
    getDurationFromTimes(startTime: string, endTime: string): number {
      const [startHour, startMinute] = startTime.split(':').map(Number)
      const [endHour, endMinute] = endTime.split(':').map(Number)
      const start = startHour * 60 + startMinute
      const end = endHour * 60 + endMinute

      return Math.max(end - start, 15)
    },
    handleGridClick(day: Date, clickEvent: MouseEvent) {
      this.openFormForSlot(day, clickEvent)
    },
    handleEventClick(eventItem: EventCalendarItem, clickEvent: MouseEvent) {
      this.previewEvent = null
      this.openFormForSlot(
        new Date(eventItem.eventDate),
        clickEvent,
        eventItem
      )
    },
    showEventPreview(eventItem: EventCalendarItem, mouseEvent: MouseEvent) {
      this.cancelHideEventPreview()

      const rect = (mouseEvent.currentTarget as HTMLElement).getBoundingClientRect()
      const cardWidth = 280
      const gap = 8
      let left = rect.right + gap
      let placement: 'left' | 'right' = 'right'

      if (left + cardWidth > window.innerWidth - 16) {
        left = Math.max(16, rect.left - cardWidth - gap)
        placement = 'left'
      }

      const top = Math.min(Math.max(16, rect.top), window.innerHeight - 220)

      this.previewPlacement = placement
      this.previewEvent = eventItem
      this.previewStyle = {
        top: `${top}px`,
        left: `${left}px`
      }
    },
    scheduleHideEventPreview() {
      this.cancelHideEventPreview()
      this.previewHideTimer = setTimeout(() => {
        this.previewEvent = null
      }, 120)
    },
    cancelHideEventPreview() {
      if (this.previewHideTimer) {
        clearTimeout(this.previewHideTimer)
        this.previewHideTimer = null
      }
    },
    closeForm() {
      this.formOpen = false
      this.formError = ''
    },
    handleOpenSchedule(eventId: number) {
      this.previewEvent = null
      this.closeForm()
      void this.$router.push({
        name: 'events-schedule',
        params: { eventId: String(eventId) }
      })
    },
    async handleCopyPreviewShareLink(eventId: number) {
      this.shareLinkLoadingEventId = eventId
      this.cancelHideEventPreview()

      try {
        const response = await eventScheduleService.generateShareLink(eventId)
        const shareHash = response.payload?.shareHash

        if (!shareHash) {
          throw new Error('Não foi possível gerar o link de compartilhamento.')
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
        this.shareLinkLoadingEventId = null
      }
    },
    buildPayload(form: EventFormState): CreateEventRequest {
      const recurrence = toRecurrenceRequest(form.recurrence)

      if (form.eventTypeId === null || form.eventTypeId <= 0) {
        throw new Error('Selecione o tipo do evento.')
      }

      return {
        name: form.name.trim(),
        description: form.description.trim() ? form.description.trim() : null,
        eventTypeId: form.eventTypeId,
        ministryId: form.ministryId,
        responsiblePersonId: form.responsiblePersonId,
        eventDate: form.eventDate,
        startTime: form.startTime ? `${form.startTime}:00` : null,
        endTime: form.endTime ? `${form.endTime}:00` : null,
        ...(recurrence ? { recurrence } : {})
      }
    },
    buildUpdatePayload(form: EventFormState, scope: SeriesEditScope): UpdateEventRequest {
      if (form.eventTypeId === null || form.eventTypeId <= 0) {
        throw new Error('Selecione o tipo do evento.')
      }

      return {
        name: form.name.trim(),
        description: form.description.trim() ? form.description.trim() : null,
        eventTypeId: form.eventTypeId,
        ministryId: form.ministryId,
        responsiblePersonId: form.responsiblePersonId,
        eventDate: form.eventDate,
        startTime: form.startTime ? `${form.startTime}:00` : null,
        endTime: form.endTime ? `${form.endTime}:00` : null,
        scope
      }
    },
    async handleFormSubmit(form: EventFormState) {
      if (form.id && form.seriesId) {
        this.seriesScopePendingForm = form
        this.seriesScopeMode = 'update'
        this.seriesScopeTitle = 'Atualizar evento da série'
        this.seriesScopeMessage = `Como deseja aplicar as alterações em "${form.name}"?`
        this.seriesScopeConfirmLabel = 'Salvar'
        this.seriesScopeTone = 'info'
        this.seriesScopeOpen = true
        return
      }

      await this.saveForm(form, 'thisOnly')
    },
    async handleFormDelete() {
      if (!this.form.id) {
        return
      }

      if (this.form.seriesId) {
        this.seriesScopePendingForm = { ...this.form }
        this.seriesScopeMode = 'delete'
        this.seriesScopeTitle = 'Excluir evento da série'
        this.seriesScopeMessage = `Como deseja excluir "${this.form.name}"? Esta ação não poderá ser desfeita.`
        this.seriesScopeConfirmLabel = 'Excluir'
        this.seriesScopeTone = 'danger'
        this.seriesScopeOpen = true
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir evento',
        message: `Deseja excluir "${this.form.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      await this.deleteForm('thisOnly')
    },
    handleSeriesScopeCancel() {
      this.seriesScopeMode = null
      this.seriesScopePendingForm = null
    },
    async handleSeriesScopeConfirm(scope: SeriesEditScope) {
      const form = this.seriesScopePendingForm
      const mode = this.seriesScopeMode
      this.seriesScopeMode = null
      this.seriesScopePendingForm = null

      if (!form || !mode) {
        return
      }

      if (mode === 'update') {
        await this.saveForm(form, scope)
        return
      }

      await this.deleteForm(scope)
    },
    async saveForm(form: EventFormState, scope: SeriesEditScope) {
      this.formLoading = true
      this.formError = ''

      try {
        if (form.id) {
          await eventService.update(form.id, this.buildUpdatePayload(form, scope))
          toastService.success('Evento atualizado com sucesso.')
        } else {
          const response = await eventService.create(this.buildPayload(form))
          const createdCount = response.payload?.createdCount ?? 1
          toastService.success(
            createdCount > 1
              ? `Foram criados ${createdCount} eventos na série até o fim do ano.`
              : 'Evento criado com sucesso.'
          )
        }

        this.formOpen = false
        await this.loadEvents()
      } catch (error) {
        this.formError = error instanceof Error
          ? error.message
          : 'Não foi possível salvar o evento.'
      } finally {
        this.formLoading = false
      }
    },
    async deleteForm(scope: SeriesEditScope) {
      if (!this.form.id) {
        return
      }

      this.formLoading = true
      this.formError = ''

      try {
        await eventService.remove(this.form.id, scope)
        toastService.success('Evento excluído com sucesso.')
        this.formOpen = false
        await this.loadEvents()
      } catch (error) {
        this.formError = error instanceof Error
          ? error.message
          : 'Não foi possível excluir o evento.'
      } finally {
        this.formLoading = false
      }
    }
  }
})
</script>

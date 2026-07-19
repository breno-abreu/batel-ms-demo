<template>
  <div class="monthly-schedule-assignment-table-wrapper">
    <table class="repertoire-table monthly-schedule-assignment-table monthly-schedule-repertoire-table">
      <thead>
        <tr>
          <th class="monthly-schedule-assignment-table__date-header">
            Evento
          </th>
          <th
            v-for="slot in slots"
            :key="slot.displayOrder"
            class="monthly-schedule-assignment-table__column-header"
          >
            <span>{{ slot.label }}</span>
          </th>
          <th class="monthly-schedule-assignment-table__column-header monthly-schedule-repertoire-table__folder-header">
            <span class="monthly-schedule-repertoire-table__folder-header-content">
              <span>Pasta</span>
              <AppTooltip
                text="Associe uma pasta de músicas ao evento quando precisar de um conjunto livre, fora das posições fixas. Não pode ser usada ao mesmo tempo que o repertório padrão."
                position="top"
              >
                <button
                  type="button"
                  class="monthly-schedule-repertoire-table__folder-help"
                  aria-label="Sobre a coluna Pasta"
                >
                  <CircleQuestionMarkIcon :size="14" aria-hidden="true" />
                </button>
              </AppTooltip>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="event in events"
          :key="event.eventId"
        >
          <th
            scope="row"
            class="monthly-schedule-assignment-table__date-cell"
          >
            <div class="monthly-schedule-repertoire-table__event-label">
              <AppTooltip v-if="canManage" text="Copiar link público do repertório">
                <button
                  type="button"
                  class="monthly-schedule-repertoire-table__share-button"
                  :class="{
                    'monthly-schedule-repertoire-table__share-button--loading': shareLoadingEventId === event.eventId
                  }"
                  :disabled="shareLoadingEventId === event.eventId"
                  :aria-label="`Copiar link do repertório de ${formatScheduleEventLabel(event, { includeTime: false })}`"
                  @click="$emit('share-link', event.eventId)"
                >
                  <LinkIcon :size="14" aria-hidden="true" />
                </button>
              </AppTooltip>
              <span>{{ formatScheduleEventLabel(event, { includeTime: false }) }}</span>
            </div>
          </th>
          <td
            v-for="slot in slots"
            :key="`${event.eventId}-${slot.displayOrder}`"
            class="monthly-schedule-assignment-table__cell"
            :class="{
              'monthly-schedule-repertoire-table__cell--disabled': hasFolder(event.eventId)
            }"
          >
            <div class="monthly-schedule-assignment-table__cell-content">
              <template v-if="!hasFolder(event.eventId)">
                <button
                  v-if="!getRepertoire(event.eventId, slot.displayOrder) && canManage"
                  type="button"
                  class="monthly-schedule-assignment-table__cell-button"
                  :aria-label="`Adicionar música em ${slot.label} para ${formatScheduleEventLabel(event, { includeTime: false })}`"
                  @click="$emit('open-cell', event.eventId, slot.displayOrder)"
                >
                  <PlusIcon :size="16" aria-hidden="true" />
                </button>

                <span
                  v-else-if="!getRepertoire(event.eventId, slot.displayOrder)"
                  class="monthly-schedule-assignment-table__assignment-skill--empty"
                >
                  —
                </span>

                <div
                  v-else
                  class="monthly-schedule-repertoire-table__assignment"
                >
                  <button
                    v-if="canManage"
                    type="button"
                    class="monthly-schedule-assignment-table__assignment monthly-schedule-repertoire-table__assignment-button"
                    :aria-label="`Alterar ${getRepertoire(event.eventId, slot.displayOrder)?.songName}`"
                    @click="$emit('open-cell', event.eventId, slot.displayOrder)"
                  >
                    <span class="monthly-schedule-assignment-table__assignment-name">
                      {{ getRepertoire(event.eventId, slot.displayOrder)?.songName }}
                    </span>
                  </button>

                  <span
                    v-else
                    class="monthly-schedule-assignment-table__assignment"
                  >
                    <span class="monthly-schedule-assignment-table__assignment-name">
                      {{ getRepertoire(event.eventId, slot.displayOrder)?.songName }}
                    </span>
                  </span>

                  <AppTooltip v-if="canManage" text="Remover música">
                    <button
                      type="button"
                      class="monthly-schedule-repertoire-table__remove"
                      :aria-label="`Remover ${getRepertoire(event.eventId, slot.displayOrder)?.songName}`"
                      @click="$emit('remove-cell', event.eventId, slot.displayOrder)"
                    >
                      <Trash2Icon :size="14" aria-hidden="true" />
                    </button>
                  </AppTooltip>
                </div>
              </template>
            </div>
          </td>
          <td class="monthly-schedule-assignment-table__cell monthly-schedule-repertoire-table__folder-cell">
            <div class="monthly-schedule-assignment-table__cell-content">
              <button
                v-if="!getRepertoireGroup(event.eventId) && canManage"
                type="button"
                class="monthly-schedule-assignment-table__cell-button"
                :aria-label="`Associar pasta de músicas para ${formatScheduleEventLabel(event, { includeTime: false })}`"
                @click="$emit('open-folder', event.eventId)"
              >
                <FolderIcon :size="16" aria-hidden="true" />
              </button>

              <span
                v-else-if="!getRepertoireGroup(event.eventId)"
                class="monthly-schedule-assignment-table__assignment-skill--empty"
              >
                —
              </span>

              <div
                v-else
                class="monthly-schedule-repertoire-table__assignment"
              >
                <button
                  type="button"
                  class="monthly-schedule-assignment-table__assignment monthly-schedule-repertoire-table__assignment-button monthly-schedule-repertoire-table__folder-button"
                  :aria-label="`Ver músicas da pasta ${getRepertoireGroup(event.eventId)?.repertoireGroupName}`"
                  @click="$emit('view-folder', event.eventId)"
                >
                  <FolderIcon :size="14" aria-hidden="true" />
                  <span class="monthly-schedule-assignment-table__assignment-name">
                    {{ getRepertoireGroup(event.eventId)?.repertoireGroupName }}
                  </span>
                </button>

                <AppTooltip v-if="canManage" text="Remover pasta">
                  <button
                    type="button"
                    class="monthly-schedule-repertoire-table__remove"
                    :aria-label="`Remover pasta ${getRepertoireGroup(event.eventId)?.repertoireGroupName}`"
                    @click="$emit('remove-folder', event.eventId)"
                  >
                    <Trash2Icon :size="14" aria-hidden="true" />
                  </button>
                </AppTooltip>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { CircleQuestionMarkIcon, FolderIcon, LinkIcon, PlusIcon, Trash2Icon } from '@lucide/vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import {
  buildRepertoireCellKey,
  formatScheduleEventLabel,
  MONTHLY_MUSIC_REPERTOIRE_SLOTS,
  type MonthlyScheduleRepertoireCell,
  type MonthlyScheduleRepertoireGroupCell,
  type MonthlyScheduleRepertoireSlot,
  type ScheduleEventItem
} from '@/utils/monthlySchedule'

export default defineComponent({
  name: 'MonthlyScheduleRepertoireTable',
  components: {
    AppTooltip,
    CircleQuestionMarkIcon,
    FolderIcon,
    LinkIcon,
    PlusIcon,
    Trash2Icon
  },
  props: {
    events: {
      type: Array as PropType<ScheduleEventItem[]>,
      required: true
    },
    repertoires: {
      type: Object as PropType<Record<string, MonthlyScheduleRepertoireCell>>,
      required: true
    },
    repertoireGroups: {
      type: Object as PropType<Record<number, MonthlyScheduleRepertoireGroupCell>>,
      required: true
    },
    shareLoadingEventId: {
      type: Number as PropType<number | null>,
      default: null
    },
    canManage: {
      type: Boolean,
      default: true
    }
  },
  emits: ['open-cell', 'remove-cell', 'open-folder', 'view-folder', 'remove-folder', 'share-link'],
  computed: {
    slots(): readonly MonthlyScheduleRepertoireSlot[] {
      return MONTHLY_MUSIC_REPERTOIRE_SLOTS
    }
  },
  methods: {
    formatScheduleEventLabel,
    hasFolder(eventId: number): boolean {
      return Boolean(this.repertoireGroups[eventId])
    },
    getRepertoire(eventId: number, displayOrder: number): MonthlyScheduleRepertoireCell | null {
      return this.repertoires[buildRepertoireCellKey(eventId, displayOrder)] ?? null
    },
    getRepertoireGroup(eventId: number): MonthlyScheduleRepertoireGroupCell | null {
      return this.repertoireGroups[eventId] ?? null
    }
  }
})
</script>

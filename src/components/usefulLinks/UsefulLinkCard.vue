<template>
  <AppTooltip
    :text="cardHoverTooltip"
    :follow-cursor="Boolean(cardHoverTooltip)"
    class="useful-link-card-tooltip"
  >
    <article
      class="useful-link-card fluent-card"
      :class="{
        'useful-link-card--addable': isAddable,
        'useful-link-card--addable-disabled': headerMode === 'add' && !isAddable
      }"
      :role="isCardInteractive ? 'button' : undefined"
      :tabindex="isCardInteractive ? 0 : undefined"
      :aria-label="cardAriaLabel"
      @click="handleCardClick"
      @keydown.enter.prevent="handleCardClick"
      @keydown.space.prevent="handleCardClick"
    >
      <header class="useful-link-card__header">
        <h3 class="useful-link-card__title">
          {{ item.name }}
        </h3>

        <div
          v-if="showHeaderActions"
          class="useful-link-card__header-actions"
        >
          <template v-if="headerMode === 'add'">
            <AppTooltip
              v-if="!addDisabled"
              text="Adicionar à pasta"
            >
              <button
                type="button"
                class="sortable-list__action sortable-list__action--active"
                :disabled="actionLoadingId === item.id || actionsDisabled"
                aria-label="Adicionar à pasta"
                @click.stop="$emit('add', item)"
              >
                <PlusIcon :size="16" aria-hidden="true" />
              </button>
            </AppTooltip>
            <button
              v-else
              type="button"
              class="sortable-list__action sortable-list__action--active"
              disabled
              aria-label="Link já incluído na pasta"
              @click.stop
            >
              <PlusIcon :size="16" aria-hidden="true" />
            </button>
          </template>

          <template v-else-if="headerMode === 'group'">
            <AppTooltip v-if="canManage" text="Editar link">
              <RouterLink
                class="sortable-list__action"
                :to="{ name: 'useful-link-details', params: { id: item.id } }"
                aria-label="Editar link"
                @click.stop
              >
                <PencilIcon :size="16" aria-hidden="true" />
              </RouterLink>
            </AppTooltip>

            <AppTooltip text="Remover da pasta">
              <button
                type="button"
                class="sortable-list__action sortable-list__action--danger"
                :disabled="actionLoadingId === item.id || actionsDisabled"
                aria-label="Remover da pasta"
                @click.stop="$emit('remove-from-group', item)"
              >
                <FolderMinusIcon :size="16" aria-hidden="true" />
              </button>
            </AppTooltip>
          </template>

          <template v-else-if="showManagementActions && canManage">
            <AppTooltip text="Editar link">
              <RouterLink
                class="sortable-list__action"
                :to="{ name: 'useful-link-details', params: { id: item.id } }"
                aria-label="Editar link"
                @click.stop
              >
                <PencilIcon :size="16" aria-hidden="true" />
              </RouterLink>
            </AppTooltip>

            <AppTooltip text="Excluir link">
              <button
                type="button"
                class="sortable-list__action sortable-list__action--danger"
                :disabled="actionLoadingId === item.id || actionsDisabled"
                aria-label="Excluir link"
                @click.stop="$emit('delete', item)"
              >
                <Trash2Icon :size="16" aria-hidden="true" />
              </button>
            </AppTooltip>
          </template>
        </div>
      </header>

      <div class="useful-link-card__body">
        <span class="repertoire-song-tag repertoire-song-tag--theme useful-link-card__badge">
          <TagIcon :size="14" aria-hidden="true" />
          {{ item.usefulLinkTypeName }}
        </span>

        <p
          v-if="item.notes"
          class="useful-link-card__notes"
        >
          {{ truncatedNotes }}
        </p>
        <p
          v-else
          class="useful-link-card__notes useful-link-card__notes--empty"
        >
          Sem observações
        </p>
      </div>

      <div class="useful-link-card__footer">
        <a
          class="repertoire-song-card__resource"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >
          <ExternalLinkIcon :size="16" aria-hidden="true" />
          Abrir link
        </a>
      </div>
    </article>
  </AppTooltip>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ExternalLinkIcon,
  FolderMinusIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon
} from '@lucide/vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import type { UsefulLink } from '@/types/usefulLinks'

const NOTES_PREVIEW_MAX_LENGTH = 90

export default defineComponent({
  name: 'UsefulLinkCard',
  components: {
    AppTooltip,
    ExternalLinkIcon,
    FolderMinusIcon,
    PencilIcon,
    PlusIcon,
    RouterLink,
    TagIcon,
    Trash2Icon
  },
  props: {
    item: {
      type: Object as PropType<UsefulLink>,
      required: true
    },
    headerMode: {
      type: String as PropType<'default' | 'add' | 'group'>,
      default: 'default'
    },
    showManagementActions: {
      type: Boolean,
      default: true
    },
    addDisabled: {
      type: Boolean,
      default: false
    },
    actionLoadingId: {
      type: Number as PropType<number | null>,
      default: null
    },
    actionsDisabled: {
      type: Boolean,
      default: false
    },
    canManage: {
      type: Boolean,
      default: true
    },
    openOnClick: {
      type: Boolean,
      default: true
    }
  },
  emits: ['add', 'delete', 'open', 'remove-from-group'],
  computed: {
    showHeaderActions(): boolean {
      return this.headerMode === 'add'
        || this.headerMode === 'group'
        || this.showManagementActions
    },
    isAddable(): boolean {
      return this.headerMode === 'add'
        && !this.addDisabled
        && !this.actionsDisabled
        && this.actionLoadingId !== this.item.id
    },
    isCardInteractive(): boolean {
      return this.headerMode === 'add' || this.openOnClick
    },
    cardHoverTooltip(): string {
      if (this.headerMode === 'add' && this.addDisabled) {
        return 'Link já incluído na pasta'
      }

      return ''
    },
    cardAriaLabel(): string | undefined {
      if (this.headerMode === 'add') {
        return this.addDisabled
          ? `${this.item.name} já incluído na pasta`
          : `Adicionar ${this.item.name} à pasta`
      }

      if (!this.openOnClick) {
        return undefined
      }

      return `Ver detalhes de ${this.item.name}`
    },
    truncatedNotes(): string {
      const notes = this.item.notes?.trim() ?? ''

      if (notes.length <= NOTES_PREVIEW_MAX_LENGTH) {
        return notes
      }

      return `${notes.slice(0, NOTES_PREVIEW_MAX_LENGTH).trimEnd()}…`
    }
  },
  methods: {
    handleCardClick(): void {
      if (this.headerMode === 'add') {
        if (!this.isAddable) {
          return
        }

        this.$emit('add', this.item)
        return
      }

      if (this.actionsDisabled) {
        return
      }

      if (!this.openOnClick) {
        return
      }

      this.$emit('open', this.item)
    }
  }
})
</script>

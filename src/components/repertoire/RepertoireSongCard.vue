<template>
  <article
    class="repertoire-song-card fluent-card"
    :class="{
      'repertoire-song-card--addable': isAddable,
      'repertoire-song-card--editable': isEditable,
      'repertoire-song-card--addable-disabled': headerMode === 'add' && !isAddable
    }"
    :role="isCardInteractive ? 'button' : undefined"
    :tabindex="isCardInteractive ? 0 : undefined"
    :aria-label="cardAriaLabel"
    @click="handleCardClick"
    @keydown.enter.prevent="handleCardClick"
    @keydown.space.prevent="handleCardClick"
  >
    <header class="repertoire-song-card__header">
      <AppTooltip
        v-if="headerMode !== 'view'"
        :text="item.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
      >
        <button
          type="button"
          class="repertoire-favorite-button"
          :class="{ 'repertoire-favorite-button--active': item.isFavorite }"
          :disabled="favoriteLoadingId === item.id || actionsDisabled"
          :aria-label="item.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
          @click.stop="$emit('toggle-favorite', item)"
        >
          <StarIcon :size="18" :fill="item.isFavorite ? 'currentColor' : 'none'" />
        </button>
      </AppTooltip>

      <div class="repertoire-song-card__heading">
        <h3 class="repertoire-song-card__title">
          {{ item.songName }}
        </h3>
        <p class="repertoire-song-card__meta-line">
          {{ formatAuthorVersion(item) }}
        </p>
      </div>

      <div
        v-if="headerMode !== 'view'"
        class="repertoire-song-card__header-actions"
      >
        <template v-if="headerMode === 'add'">
          <AppTooltip
            :text="addTooltipText"
            position="left"
          >
            <button
              type="button"
              class="sortable-list__action sortable-list__action--active"
              :disabled="addDisabled || actionLoadingId === item.id || actionsDisabled"
              :aria-label="addAriaLabel"
              @click.stop="$emit('add', item)"
            >
              <PlusIcon :size="16" aria-hidden="true" />
            </button>
          </AppTooltip>
        </template>

        <template v-else-if="headerMode === 'group'">
          <template v-if="canManage">
            <AppTooltip text="Editar música">
              <RouterLink
                class="sortable-list__action"
                :to="{ name: 'repertoire-details', params: { id: item.id } }"
                aria-label="Editar música"
                @click.stop
              >
                <PencilIcon :size="16" aria-hidden="true" />
              </RouterLink>
            </AppTooltip>
          </template>

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

        <template v-else-if="canManage">
          <AppTooltip text="Editar música">
            <RouterLink
              class="sortable-list__action"
              :to="{ name: 'repertoire-details', params: { id: item.id } }"
              aria-label="Editar música"
              @click.stop
            >
              <PencilIcon :size="16" aria-hidden="true" />
            </RouterLink>
          </AppTooltip>

          <AppTooltip text="Excluir música">
            <button
              type="button"
              class="sortable-list__action sortable-list__action--danger"
              :disabled="actionLoadingId === item.id || actionsDisabled"
              aria-label="Excluir música"
              @click.stop="$emit('delete', item)"
            >
              <Trash2Icon :size="16" aria-hidden="true" />
            </button>
          </AppTooltip>
        </template>
      </div>
    </header>

    <div
      v-if="hasBadges(item)"
      class="repertoire-song-card__badges"
    >
      <span
        v-if="item.key"
        class="repertoire-song-badge repertoire-song-badge--key"
      >
        Tom: {{ item.key }}
      </span>
      <span
        v-if="item.difficultyLevelName"
        class="repertoire-song-badge repertoire-song-badge--difficulty"
      >
        {{ item.difficultyLevelName }}
      </span>
      <span
        v-if="item.popularityLevelName"
        class="repertoire-song-badge repertoire-song-badge--popularity"
      >
        {{ item.popularityLevelName }}
      </span>
      <span
        v-for="theme in item.musicalThemes"
        :key="theme.id"
        class="repertoire-song-tag repertoire-song-tag--theme"
      >
        <TagIcon :size="14" aria-hidden="true" />
        {{ theme.name }}
      </span>
    </div>

    <p
      class="repertoire-song-card__notes"
      :class="{ 'repertoire-song-card__notes--empty': !item.notes }"
    >
      {{ item.notes || 'Sem anotações' }}
    </p>

    <div
      v-if="hasVisibleResourceActions"
      class="repertoire-song-card__actions"
    >
      <a
        v-if="item.referenceUrl1 && shouldShowResource('reference1')"
        class="repertoire-song-card__resource"
        :href="item.referenceUrl1"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <ExternalLinkIcon :size="16" aria-hidden="true" />
        Referência 1
      </a>

      <a
        v-if="item.referenceUrl2 && shouldShowResource('reference2')"
        class="repertoire-song-card__resource"
        :href="item.referenceUrl2"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <ExternalLinkIcon :size="16" aria-hidden="true" />
        Referência 2
      </a>

      <button
        v-if="item.lyrics && shouldShowResource('lyrics')"
        type="button"
        class="repertoire-song-card__resource"
        @click.stop="$emit('open-lyrics', item)"
      >
        <ScrollTextIcon :size="16" aria-hidden="true" />
        Letra
      </button>

      <a
        v-if="item.playbackUrl && shouldShowResource('playback')"
        class="repertoire-song-card__resource"
        :href="item.playbackUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <CirclePlayIcon :size="16" aria-hidden="true" />
        Playback
      </a>

      <a
        v-if="item.sopranoKitVoiceUrl && shouldShowResource('soprano')"
        class="repertoire-song-card__resource"
        :href="item.sopranoKitVoiceUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <MicIcon :size="16" aria-hidden="true" />
        Soprano
      </a>

      <a
        v-if="item.contraltoKitVoiceUrl && shouldShowResource('contralto')"
        class="repertoire-song-card__resource"
        :href="item.contraltoKitVoiceUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <MicIcon :size="16" aria-hidden="true" />
        Contralto
      </a>

      <a
        v-if="item.tenorKitVoiceUrl && shouldShowResource('tenor')"
        class="repertoire-song-card__resource"
        :href="item.tenorKitVoiceUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <MicIcon :size="16" aria-hidden="true" />
        Tenor
      </a>

      <a
        v-if="item.chordUrl && shouldShowResource('chord')"
        class="repertoire-song-card__resource"
        :href="item.chordUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <MusicIcon :size="16" aria-hidden="true" />
        Cifra
      </a>

      <a
        v-if="item.sheetMusicUrl && shouldShowResource('sheetMusic')"
        class="repertoire-song-card__resource"
        :href="item.sheetMusicUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <FileMusicIcon :size="16" aria-hidden="true" />
        Partitura
      </a>
    </div>
  </article>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { RouterLink } from 'vue-router'
import {
  CirclePlayIcon,
  ExternalLinkIcon,
  FileMusicIcon,
  FolderMinusIcon,
  MicIcon,
  MusicIcon,
  PencilIcon,
  PlusIcon,
  ScrollTextIcon,
  StarIcon,
  TagIcon,
  Trash2Icon
} from '@lucide/vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import type { RepertoireListItem } from '@/types/repertoire'
import {
  formatAuthorVersion,
  hasBadges,
  hasResourceActions
} from '@/utils/repertoireCardUtils'

export type RepertoireSongCardHeaderMode = 'manage' | 'add' | 'group' | 'view'
export type RepertoireSongCardAddContext = 'folder' | 'repertoire'
export type RepertoireSongCardResourceFilter =
  | 'all'
  | 'reference1'
  | 'reference2'
  | 'lyrics'
  | 'playback'
  | 'soprano'
  | 'contralto'
  | 'tenor'
  | 'chord'
  | 'sheetMusic'

export default defineComponent({
  name: 'RepertoireSongCard',
  components: {
    AppTooltip,
    CirclePlayIcon,
    ExternalLinkIcon,
    FileMusicIcon,
    FolderMinusIcon,
    MicIcon,
    MusicIcon,
    PencilIcon,
    PlusIcon,
    RouterLink,
    ScrollTextIcon,
    StarIcon,
    TagIcon,
    Trash2Icon
  },
  props: {
    item: {
      type: Object as PropType<RepertoireListItem>,
      required: true
    },
    headerMode: {
      type: String as PropType<RepertoireSongCardHeaderMode>,
      default: 'manage'
    },
    favoriteLoadingId: {
      type: Number as PropType<number | null>,
      default: null
    },
    actionLoadingId: {
      type: Number as PropType<number | null>,
      default: null
    },
    addDisabled: {
      type: Boolean,
      default: false
    },
    addContext: {
      type: String as PropType<RepertoireSongCardAddContext>,
      default: 'folder'
    },
    actionsDisabled: {
      type: Boolean,
      default: false
    },
    canManage: {
      type: Boolean,
      default: true
    },
    resourceFilter: {
      type: String as PropType<RepertoireSongCardResourceFilter>,
      default: 'all'
    }
  },
  emits: [
    'toggle-favorite',
    'delete',
    'add',
    'remove-from-group',
    'open-lyrics'
  ],
  computed: {
    isAddable(): boolean {
      return this.headerMode === 'add'
        && !this.addDisabled
        && !this.actionsDisabled
        && this.actionLoadingId !== this.item.id
    },
    isEditable(): boolean {
      return this.canManage
        && !this.actionsDisabled
        && (this.headerMode === 'manage' || this.headerMode === 'group')
    },
    isCardInteractive(): boolean {
      return this.isAddable || this.isEditable
    },
    cardAriaLabel(): string | undefined {
      if (this.isAddable) {
        return this.addAriaLabel
      }

      if (this.isEditable) {
        return `Editar ${this.item.songName}`
      }

      return undefined
    },
    hasVisibleResourceActions(): boolean {
      if (this.resourceFilter === 'all') {
        return hasResourceActions(this.item)
      }

      const resourceAvailability: Record<Exclude<RepertoireSongCardResourceFilter, 'all'>, boolean> = {
        reference1: Boolean(this.item.referenceUrl1),
        reference2: Boolean(this.item.referenceUrl2),
        lyrics: Boolean(this.item.lyrics),
        playback: Boolean(this.item.playbackUrl),
        soprano: Boolean(this.item.sopranoKitVoiceUrl),
        contralto: Boolean(this.item.contraltoKitVoiceUrl),
        tenor: Boolean(this.item.tenorKitVoiceUrl),
        chord: Boolean(this.item.chordUrl),
        sheetMusic: Boolean(this.item.sheetMusicUrl)
      }

      return resourceAvailability[this.resourceFilter]
    },
    addTooltipText(): string {
      if (this.addContext === 'repertoire') {
        return this.addDisabled
          ? 'Música já incluída no repertório'
          : 'Adicionar ao repertório'
      }

      return this.addDisabled
        ? 'Música já incluída na pasta'
        : 'Adicionar à pasta'
    },
    addAriaLabel(): string {
      return this.addContext === 'repertoire'
        ? 'Adicionar ao repertório'
        : 'Adicionar à pasta'
    }
  },
  methods: {
    formatAuthorVersion,
    hasBadges,
    hasResourceActions,
    shouldShowResource(resource: Exclude<RepertoireSongCardResourceFilter, 'all'>): boolean {
      return this.resourceFilter === 'all' || this.resourceFilter === resource
    },
    handleCardClick(): void {
      if (this.isAddable) {
        this.$emit('add', this.item)
        return
      }

      if (!this.isEditable) {
        return
      }

      void this.$router.push({
        name: 'repertoire-details',
        params: { id: this.item.id }
      })
    }
  }
})
</script>

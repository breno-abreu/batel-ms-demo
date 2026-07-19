<template>
  <AppFormModal
    :model-value="modelValue"
    :title="modalTitle"
    confirm-label="Fechar"
    single-action
    wide
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleClose"
    @cancel="handleClose"
      :scrollable-body="true"
    >
    <div class="monthly-schedule-folder-songs-modal">
      <p
        v-if="eventLabel"
        class="description monthly-schedule-folder-songs-modal__context"
      >
        Evento: <strong>{{ eventLabel }}</strong>
      </p>

      <div class="monthly-schedule-folder-songs-modal__toolbar">
        <span class="repertoire-badge">{{ songsCountLabel }}</span>
        <button
          type="button"
          class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
          @click="$emit('change-folder')"
        >
          <FolderIcon :size="16" aria-hidden="true" />
          Trocar pasta
        </button>
      </div>

      <div
        v-if="loading"
        class="repertoire-song-grid repertoire-song-grid--skeleton"
        aria-hidden="true"
      >
        <div
          v-for="index in 3"
          :key="index"
          class="repertoire-song-card repertoire-song-card--skeleton"
        >
          <span class="app-skeleton app-skeleton--title" />
          <span class="app-skeleton app-skeleton--description" />
        </div>
      </div>

      <p
        v-else-if="errorMessage"
        class="description"
      >
        {{ errorMessage }}
      </p>

      <p
        v-else-if="songs.length === 0"
        class="description"
      >
        Nenhuma música incluída nesta pasta.
      </p>

      <div
        v-else
        class="repertoire-song-grid monthly-schedule-folder-songs-modal__grid"
      >
        <RepertoireSongCard
          v-for="item in songs"
          :key="item.id"
          :item="item"
          header-mode="view"
        />
      </div>
    </div>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { FolderIcon } from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import RepertoireSongCard from '@/components/repertoire/RepertoireSongCard.vue'
import { repertoireGroupService } from '@/services/repertoireGroupService'
import type { RepertoireListItem } from '@/types/repertoire'

export default defineComponent({
  name: 'MonthlyScheduleFolderSongsModal',
  components: {
    AppFormModal,
    FolderIcon,
    RepertoireSongCard
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    folderId: {
      type: Number as PropType<number | null>,
      default: null
    },
    folderName: {
      type: String,
      default: ''
    },
    eventLabel: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change-folder'],
  data() {
    return {
      loading: false,
      songs: [] as RepertoireListItem[],
      errorMessage: ''
    }
  },
  computed: {
    modalTitle(): string {
      return this.folderName
        ? `Músicas — ${this.folderName}`
        : 'Músicas da pasta'
    },
    songsCountLabel(): string {
      const count = this.songs.length

      if (this.loading) {
        return 'Carregando...'
      }

      if (count === 0) {
        return 'Nenhuma música'
      }

      if (count === 1) {
        return '1 música'
      }

      return `${count} músicas`
    }
  },
  watch: {
    modelValue(isVisible: boolean) {
      if (isVisible) {
        void this.loadSongs()
      } else {
        this.songs = []
        this.errorMessage = ''
      }
    }
  },
  methods: {
    async loadSongs() {
      if (!this.folderId) {
        this.songs = []
        this.errorMessage = 'Pasta inválida.'
        return
      }

      this.loading = true
      this.errorMessage = ''

      try {
        const response = await repertoireGroupService.listRepertoires(this.folderId)
        this.songs = response.payload ?? []
      } catch (error) {
        this.songs = []
        this.errorMessage = error instanceof Error
          ? error.message
          : 'Não foi possível carregar as músicas da pasta.'
      } finally {
        this.loading = false
      }
    },
    handleClose() {
      this.$emit('update:modelValue', false)
    }
  }
})
</script>

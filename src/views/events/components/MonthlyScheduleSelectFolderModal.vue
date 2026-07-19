<template>
  <AppFormModal
    :model-value="modelValue"
    title="Selecionar pasta de músicas"
    confirm-label="Fechar"
    single-action
    wide
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleClose"
    @cancel="handleClose"
      :scrollable-body="true"
    >
    <div class="monthly-schedule-select-folder-modal">
      <p
        v-if="eventLabel"
        class="description monthly-schedule-select-folder-modal__context"
      >
        Evento: <strong>{{ eventLabel }}</strong>
      </p>

      <div
        v-if="!loading && folders.length > 0"
        class="repertoire-list-search"
      >
        <SearchIcon
          class="repertoire-list-search__icon"
          :size="16"
          aria-hidden="true"
        />
        <input
          id="monthly-schedule-select-folder-modal-search"
          v-model="searchQuery"
          type="search"
          class="field-control repertoire-list-search__input"
          placeholder="Buscar pasta..."
          aria-label="Buscar pastas"
        >
      </div>

      <div
        v-if="loading"
        class="monthly-schedule-select-folder-modal__loading"
        aria-hidden="true"
      >
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
      </div>

      <p v-else-if="folders.length === 0" class="description">
        Nenhuma pasta de músicas disponível.
      </p>

      <p v-else-if="filteredFolders.length === 0" class="description">
        Nenhuma pasta encontrada para a busca.
      </p>

      <div
        v-else
        class="monthly-schedule-select-folder-modal__folders"
        role="listbox"
        aria-label="Selecionar pasta"
      >
        <button
          v-for="folder in filteredFolders"
          :key="folder.id"
          type="button"
          class="fluent-card monthly-schedule-select-folder-modal__folder-card selectable-card"
          :class="{
            'monthly-schedule-select-folder-modal__folder-card--selected': isCurrentFolder(folder.id)
          }"
          role="option"
          :aria-selected="isCurrentFolder(folder.id) ? 'true' : 'false'"
          @click="selectFolder(folder)"
        >
          <span class="monthly-schedule-select-folder-modal__folder-icon" aria-hidden="true">
            <FolderIcon :size="18" />
          </span>
          <span class="monthly-schedule-select-folder-modal__folder-content">
            <span class="monthly-schedule-select-folder-modal__folder-name">
              {{ folder.name }}
            </span>
            <span
              v-if="folder.itemCount > 0"
              class="monthly-schedule-select-folder-modal__folder-meta"
            >
              {{ folder.itemCount === 1 ? '1 música' : `${folder.itemCount} músicas` }}
            </span>
          </span>
        </button>
      </div>
    </div>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { FolderIcon, SearchIcon } from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import { repertoireGroupService } from '@/services/repertoireGroupService'
import type { RepertoireGroup } from '@/types/repertoireGroup'
import type { MonthlyScheduleRepertoireGroupCell } from '@/utils/monthlySchedule'

export default defineComponent({
  name: 'MonthlyScheduleSelectFolderModal',
  components: {
    AppFormModal,
    FolderIcon,
    SearchIcon
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    eventLabel: {
      type: String,
      default: ''
    },
    initialFolder: {
      type: Object as PropType<MonthlyScheduleRepertoireGroupCell | null>,
      default: null
    }
  },
  emits: ['update:modelValue', 'select'],
  data() {
    return {
      loading: false,
      folders: [] as RepertoireGroup[],
      searchQuery: ''
    }
  },
  computed: {
    filteredFolders(): RepertoireGroup[] {
      const query = this.searchQuery.trim().toLowerCase()

      if (!query) {
        return this.folders
      }

      return this.folders.filter((folder) => folder.name.toLowerCase().includes(query))
    }
  },
  watch: {
    modelValue(isVisible: boolean) {
      if (isVisible) {
        this.searchQuery = ''
        void this.loadFolders()
      }
    }
  },
  methods: {
    async loadFolders() {
      this.loading = true

      try {
        const response = await repertoireGroupService.list()
        this.folders = response.payload ?? []
      } catch {
        this.folders = []
      } finally {
        this.loading = false
      }
    },
    isCurrentFolder(folderId: number): boolean {
      return this.initialFolder?.repertoireGroupId === folderId
    },
    selectFolder(folder: RepertoireGroup) {
      this.$emit('select', {
        repertoireGroupId: folder.id,
        repertoireGroupName: folder.name
      })
      this.$emit('update:modelValue', false)
    },
    handleClose() {
      this.$emit('update:modelValue', false)
    }
  }
})
</script>

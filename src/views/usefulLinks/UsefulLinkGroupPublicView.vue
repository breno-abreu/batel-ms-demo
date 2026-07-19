<template>
  <section
    class="
      repertoire-page
      repertoire-page--public
      event-schedule-public-page
      useful-link-group-public-page
    "
  >
    <header
      class="
        repertoire-page__header
        event-schedule-public-page__header
        fluent-card
      "
    >
      <div>
        <p class="event-schedule-public-page__eyebrow">
          Links úteis compartilhados
        </p>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <FolderIcon :size="22" />
          </span>
          <h1>{{ pageTitle }}</h1>
        </div>
        <p
          v-if="group?.description"
          class="description repertoire-page__header-description"
        >
          {{ group.description }}
        </p>
        <p
          v-else
          class="description repertoire-page__header-description"
        >
          Pasta compartilhada de links úteis do Bless App.
        </p>
      </div>
    </header>

    <div
      v-if="pageLoading"
      class="
        useful-link-grid
        useful-link-grid--skeleton
        useful-link-group-public-page__content
      "
      aria-hidden="true"
    >
      <div
        v-for="index in 3"
        :key="index"
        class="useful-link-card useful-link-card--skeleton"
      >
        <span class="app-skeleton app-skeleton--title" />
        <span class="app-skeleton app-skeleton--description" />
      </div>
    </div>

    <section
      v-else-if="group"
      class="
        repertoire-card
        useful-link-group-public-page__content
        fluent-card
      "
    >
      <div class="repertoire-card__title-row">
        <h2>Links na pasta</h2>
        <span class="repertoire-badge">{{ linksCountLabel }}</span>
      </div>

      <p v-if="links.length === 0" class="description">
        Nenhum link incluído nesta pasta.
      </p>

      <div
        v-else
        class="useful-link-grid"
      >
        <UsefulLinkCard
          v-for="item in links"
          :key="item.id"
          :item="item"
          :show-management-actions="false"
          @open="openDetailsModal"
        />
      </div>
    </section>

    <AppFormModal
      v-model="detailsModalVisible"
      :title="detailsItem?.name ?? 'Link útil'"
      confirm-label="Fechar"
      single-action
      @confirm="closeDetailsModal"
      @cancel="closeDetailsModal"
    >
      <div
        v-if="detailsItem"
        class="useful-link-details-modal"
      >
        <span class="repertoire-song-tag repertoire-song-tag--theme">
          <TagIcon :size="14" aria-hidden="true" />
          {{ detailsItem.usefulLinkTypeName }}
        </span>

        <div class="useful-link-details-modal__field">
          <span class="useful-link-details-modal__label">URL</span>
          <a
            class="repertoire-song-card__resource useful-link-details-modal__url"
            :href="detailsItem.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon :size="16" aria-hidden="true" />
            Abrir link
          </a>
          <p class="useful-link-details-modal__url-text">
            {{ detailsItem.url }}
          </p>
        </div>

        <div class="useful-link-details-modal__field">
          <span class="useful-link-details-modal__label">Observações</span>
          <p
            class="useful-link-details-modal__notes"
            :class="{ 'useful-link-details-modal__notes--empty': !detailsItem.notes }"
          >
            {{ detailsItem.notes || 'Sem observações' }}
          </p>
        </div>
      </div>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ExternalLinkIcon, FolderIcon, TagIcon } from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import UsefulLinkCard from '@/components/usefulLinks/UsefulLinkCard.vue'
import { usefulLinkGroupService } from '@/services/usefulLinkGroupService'
import type { UsefulLink } from '@/types/usefulLinks'
import type { PublicUsefulLinkGroup } from '@/types/usefulLinkGroup'

export default defineComponent({
  name: 'UsefulLinkGroupPublicView',
  components: {
    AppFormModal,
    ExternalLinkIcon,
    FolderIcon,
    TagIcon,
    UsefulLinkCard
  },
  data() {
    return {
      group: null as PublicUsefulLinkGroup | null,
      links: [] as UsefulLink[],
      pageLoading: false,
      detailsModalVisible: false,
      detailsItem: null as UsefulLink | null
    }
  },
  computed: {
    shareHash(): string | null {
      const value = this.$route.params.shareHash

      if (typeof value !== 'string' || !value.trim()) {
        return null
      }

      return value.trim()
    },
    pageTitle(): string {
      return this.group?.name ?? 'Pasta compartilhada'
    },
    linksCountLabel(): string {
      return String(this.links.length)
    }
  },
  watch: {
    '$route.params.shareHash'() {
      void this.initializePage()
    }
  },
  mounted() {
    void this.initializePage()
  },
  methods: {
    async initializePage(): Promise<void> {
      if (!this.shareHash) {
        await this.$router.replace({ name: 'public-not-found' })
        return
      }

      this.pageLoading = true
      this.closeDetailsModal()

      try {
        const [groupResponse, linksResponse] = await Promise.all([
          usefulLinkGroupService.getPublicByShareHash(this.shareHash),
          usefulLinkGroupService.listPublicUsefulLinks(this.shareHash)
        ])

        if (!groupResponse.payload) {
          throw new Error('Pasta não encontrada.')
        }

        this.group = groupResponse.payload
        this.links = linksResponse.payload ?? []
      } catch {
        await this.$router.replace({ name: 'public-not-found' })
      } finally {
        this.pageLoading = false
      }
    },

    openDetailsModal(item: UsefulLink): void {
      this.detailsItem = item
      this.detailsModalVisible = true
    },

    closeDetailsModal(): void {
      this.detailsModalVisible = false
      this.detailsItem = null
    }
  }
})
</script>

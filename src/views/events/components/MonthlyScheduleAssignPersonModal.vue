<template>
  <AppFormModal
    :model-value="modelValue"
    :title="modalTitle"
    confirm-label="Fechar"
    single-action
    wide
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleCancel"
    @cancel="handleCancel"
      :scrollable-body="true"
    >
    <div class="monthly-schedule-assign-modal">
      <p
        v-if="eventLabel"
        class="description monthly-schedule-assign-modal__context"
      >
        Evento: <strong>{{ eventLabel }}</strong>
      </p>

      <div
        v-if="people.length > 0"
        class="repertoire-list-search"
      >
        <SearchIcon
          class="repertoire-list-search__icon"
          :size="16"
          aria-hidden="true"
        />
        <input
          id="monthly-schedule-assign-modal-search"
          v-model="searchQuery"
          type="search"
          class="field-control repertoire-list-search__input"
          placeholder="Buscar por nome..."
          aria-label="Buscar pessoas"
        >
      </div>

      <p v-if="people.length === 0" class="description">
        Nenhuma pessoa disponível neste ministério.
      </p>

      <p v-else-if="filteredPeople.length === 0" class="description">
        Nenhuma pessoa encontrada para a busca.
      </p>

      <div
        v-else
        class="monthly-schedule-assign-modal__people"
        role="listbox"
        aria-label="Selecionar pessoa"
      >
        <article
          v-for="person in filteredPeople"
          :key="person.id"
          class="fluent-card monthly-schedule-assign-modal__person-card"
          :class="{
            'monthly-schedule-assign-modal__person-card--selected': isCurrentAssignment(person.id)
          }"
          role="option"
          :aria-selected="isCurrentAssignment(person.id) ? 'true' : 'false'"
        >
          <button
            type="button"
            class="monthly-schedule-assign-modal__person-select"
            @click="selectPerson(person)"
          >
            <span class="monthly-schedule-assign-modal__person-icon" aria-hidden="true">
              <UserRoundIcon :size="18" />
            </span>
            <span class="monthly-schedule-assign-modal__person-name">
              {{ formatPersonLabel(person) }}
            </span>
          </button>

          <select
            v-if="person.skills.length > 0"
            :id="`monthly-schedule-assign-skill-${person.id}`"
            class="field-control monthly-schedule-assign-modal__skill-select"
            :value="getSkillIdForPerson(person)"
            aria-label="Função na escala"
            @click.stop
            @change="handleSkillChange(person.id, $event)"
          >
            <option :value="''">
              Nenhuma
            </option>
            <option
              v-for="skill in person.skills"
              :key="skill.id"
              :value="skill.id"
            >
              {{ skill.name }}
            </option>
          </select>
        </article>
      </div>
    </div>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { SearchIcon, UserRoundIcon } from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import type { MinistryMemberForSchedule } from '@/types/teamSchedules'
import type { MonthlyScheduleCellAssignment } from '@/utils/monthlySchedule'

export default defineComponent({
  name: 'MonthlyScheduleAssignPersonModal',
  components: {
    AppFormModal,
    SearchIcon,
    UserRoundIcon
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    people: {
      type: Array as PropType<MinistryMemberForSchedule[]>,
      required: true
    },
    excludedPersonIds: {
      type: Object as PropType<Set<number>>,
      default: () => new Set<number>()
    },
    eventLabel: {
      type: String,
      default: ''
    },
    initialAssignment: {
      type: Object as PropType<MonthlyScheduleCellAssignment | null>,
      default: null
    }
  },
  emits: ['update:modelValue', 'confirm'],
  data() {
    return {
      searchQuery: '',
      skillByPersonId: {} as Record<number, number | null>
    }
  },
  computed: {
    modalTitle(): string {
      return this.hasExistingAssignment
        ? 'Alterar pessoa na escala'
        : 'Definir pessoa na escala'
    },
    hasExistingAssignment(): boolean {
      return this.initialAssignment !== null
    },
    filteredPeople(): MinistryMemberForSchedule[] {
      const query = this.searchQuery.trim().toLowerCase()
      const availablePeople = this.people.filter(
        (person) => !this.excludedPersonIds.has(person.id)
      )

      if (!query) {
        return availablePeople
      }

      return availablePeople.filter((person) =>
        this.formatPersonLabel(person).toLowerCase().includes(query)
      )
    }
  },
  watch: {
    modelValue(isOpen: boolean) {
      if (isOpen) {
        this.resetForm()
        return
      }

      this.resetForm()
    }
  },
  methods: {
    resetForm(): void {
      this.searchQuery = ''
      this.skillByPersonId = {}

      if (this.initialAssignment) {
        this.skillByPersonId[this.initialAssignment.personId] = this.initialAssignment.skillId
      }
    },
    formatPersonLabel(person: MinistryMemberForSchedule): string {
      return person.preferredName?.trim() || person.fullName
    },
    isCurrentAssignment(personId: number): boolean {
      return this.initialAssignment?.personId === personId
    },
    getSkillIdForPerson(person: MinistryMemberForSchedule): number | '' {
      if (person.id in this.skillByPersonId) {
        const skillId = this.skillByPersonId[person.id]

        return skillId ?? ''
      }

      return person.skills[0]?.id ?? ''
    },
    handleSkillChange(personId: number, event: Event): void {
      const value = (event.target as HTMLSelectElement).value

      this.skillByPersonId = {
        ...this.skillByPersonId,
        [personId]: value === '' ? null : Number(value)
      }
    },
    selectPerson(person: MinistryMemberForSchedule): void {
      const rawSkillId = this.getSkillIdForPerson(person)
      const skillId = rawSkillId === '' ? null : rawSkillId
      const selectedSkill = person.skills.find((skill) => skill.id === skillId) ?? null

      this.$emit('confirm', {
        personId: person.id,
        personName: this.formatPersonLabel(person),
        skillId: selectedSkill?.id ?? null,
        skillName: selectedSkill?.name ?? null
      })
      this.$emit('update:modelValue', false)
    },
    handleCancel(): void {
      this.$emit('update:modelValue', false)
    }
  }
})
</script>

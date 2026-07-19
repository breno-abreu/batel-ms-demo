<template>
  <span
    ref="triggerRef"
    class="app-tooltip"
    @mouseenter="handleShow"
    @mousemove="handleMouseMove"
    @mouseleave="handleHide"
    @focusin="handleShow"
    @focusout="handleHide"
  >
    <span class="app-tooltip__trigger">
      <slot />
    </span>

    <Teleport to="body">
      <span
        v-if="visible && text"
        ref="contentRef"
        class="app-tooltip__content app-tooltip__content--floating"
        :class="{ 'app-tooltip__content--follow-cursor': followCursor }"
        :style="floatingStyle"
        role="tooltip"
      >
        {{ text }}
      </span>
    </Teleport>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

const TOOLTIP_GAP = 8
const CURSOR_OFFSET_X = 12
const CURSOR_OFFSET_Y = 16

export default defineComponent({
  name: 'AppTooltip',
  props: {
    text: {
      type: String,
      required: true
    },
    position: {
      type: String as () => TooltipPosition,
      default: 'top'
    },
    followCursor: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      floatingStyle: {} as Record<string, string>,
      cursorX: 0,
      cursorY: 0
    }
  },
  watch: {
    visible(isVisible: boolean): void {
      if (isVisible) {
        window.addEventListener('scroll', this.updatePosition, true)
        window.addEventListener('resize', this.updatePosition)
        return
      }

      window.removeEventListener('scroll', this.updatePosition, true)
      window.removeEventListener('resize', this.updatePosition)
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.updatePosition, true)
    window.removeEventListener('resize', this.updatePosition)
  },
  methods: {
    handleShow(event: MouseEvent | FocusEvent): void {
      if (!this.text) {
        return
      }

      if (this.followCursor && event instanceof MouseEvent) {
        this.cursorX = event.clientX
        this.cursorY = event.clientY
      }

      this.visible = true
      void this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.updatePosition()
        })
      })
    },

    handleMouseMove(event: MouseEvent): void {
      if (!this.followCursor || !this.visible || !this.text) {
        return
      }

      this.cursorX = event.clientX
      this.cursorY = event.clientY
      this.updatePosition()
    },

    handleHide(): void {
      this.visible = false
    },

    updatePosition(): void {
      const content = this.$refs.contentRef as HTMLElement | undefined

      if (!content) {
        return
      }

      const contentRect = content.getBoundingClientRect()
      const viewportPadding = 8

      let top = 0
      let left = 0

      if (this.followCursor) {
        top = this.cursorY + CURSOR_OFFSET_Y
        left = this.cursorX + CURSOR_OFFSET_X
      } else {
        const trigger = this.$refs.triggerRef as HTMLElement | undefined

        if (!trigger) {
          return
        }

        const triggerRect = trigger.getBoundingClientRect()

        switch (this.position) {
          case 'bottom':
            top = triggerRect.bottom + TOOLTIP_GAP
            left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2
            break
          case 'left':
            top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2
            left = triggerRect.left - contentRect.width - TOOLTIP_GAP
            break
          case 'right':
            top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2
            left = triggerRect.right + TOOLTIP_GAP
            break
          default:
            top = triggerRect.top - contentRect.height - TOOLTIP_GAP
            left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2
            break
        }
      }

      const maxLeft = window.innerWidth - contentRect.width - viewportPadding
      const maxTop = window.innerHeight - contentRect.height - viewportPadding

      left = Math.min(Math.max(viewportPadding, left), maxLeft)
      top = Math.min(Math.max(viewportPadding, top), maxTop)

      this.floatingStyle = {
        top: `${top}px`,
        left: `${left}px`
      }
    }
  }
})
</script>

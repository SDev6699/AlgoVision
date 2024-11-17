<template>
  <div
    :id="`cell-${cell.row}-${cell.col}`"
    :class="cellClass"
    @mousedown="handleMouseDown"
    @mouseenter="handleMouseEnter"
    @mouseup="handleMouseUp"
    :aria-label="getAriaLabel()"
    role="button"
    tabindex="0"
  >
    <span v-if="cell.state === 'start'" class="text-white">S</span>
    <span v-else-if="cell.state === 'end'" class="text-white">E</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useAlgorithms } from '@/composables/useAlgorithms';
import { animationsEnabled } from '@/composables/useAnimations'; // Import animationsEnabled
import type { CellState } from '@/composables/useGrid';

export default defineComponent({
  name: 'CellComponent',
  props: {
    cell: {
      type: Object as PropType<{
        row: number;
        col: number;
        state: CellState;
      }>,
      required: true,
    },
    isMouseDown: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const { selectedAlgorithm } = useAlgorithms();
    return {
      selectedAlgorithm,
      animationsEnabled, // Make animationsEnabled available in the template
    };
  },
  computed: {
    cellClass(): string {
      let classes = '';
      switch (this.cell.state) {
        case 'start':
          classes = 'bg-green-500 flex items-center justify-center';
          break;
        case 'end':
          classes = 'bg-red-500 flex items-center justify-center';
          break;
        case 'wall':
          classes = 'bg-gray-800';
          break;
        case 'visited':
          classes = ''; // GSAP handles visited cell colors
          break;
        case 'path':
          classes = ''; // GSAP handles path cell colors
          break;
        default:
          classes = 'bg-gray-700 hover:bg-gray-600 transition-colors duration-200';
      }
      // Append common classes for scaling on hover
      classes += ' transform transition-transform duration-200 hover:scale-105';
      
      // Conditionally add the 'pulse' class for start and end nodes if animations are enabled
      if (
        (this.cell.state === 'start' || this.cell.state === 'end') &&
        animationsEnabled.value
      ) {
        classes += ' pulse';
      }
      return classes;
    },
  },
  methods: {
    handleMouseDown() {
      this.$emit('cellMouseDown', this.cell.row, this.cell.col);
    },
    handleMouseEnter() {
      if (this.isMouseDown) {
        this.$emit('cellMouseEnter', this.cell.row, this.cell.col);
      }
    },
    handleMouseUp() {
      this.$emit('cellMouseUp');
    },
    getAriaLabel(): string {
      switch (this.cell.state) {
        case 'start':
          return 'Start Node';
        case 'end':
          return 'End Node';
        case 'wall':
          return 'Wall';
        case 'visited':
          return 'Visited Node';
        case 'path':
          return 'Path Node';
        default:
          return 'Empty Node';
      }
    },
  },
});
</script>

<style scoped>
/* Define keyframes for pulsing effect without glow */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Apply the pulsing animation */
.pulse {
  animation: pulse 2s infinite;
}

/* Existing cell styles */
div {
  width: 20px;
  height: 20px;
  border: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  position: relative;
  overflow: visible;
  cursor: pointer;
}

/* Optional: Transition for smooth hover effect */
.transition-colors {
  transition-property: background-color;
}
</style>
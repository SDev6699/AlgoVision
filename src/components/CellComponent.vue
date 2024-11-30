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
    <!-- Overlay for animating opacity and transform -->
    <div
      class="cell-overlay"
      :style="overlayStyle"
    ></div>
    <span v-if="cell.state === 'start'" class="text-white">S</span>
    <span v-else-if="cell.state === 'end'" class="text-white">E</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { useAlgorithms } from '@/composables/useAlgorithms';
import { animationsEnabled } from '@/composables/useAnimations';
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
      animationsEnabled,
    };
  },
  computed: {
    cellClass(): string {
      let classes = '';
      switch (this.cell.state) {
        case 'start':
          classes = 'start-cell flex items-center justify-center';
          break;
        case 'end':
          classes = 'end-cell flex items-center justify-center';
          break;
        case 'wall':
          classes = 'wall-cell';
          break;
        case 'visited':
          classes = 'visited-cell';
          break;
        case 'path':
          classes = 'path-cell';
          break;
        default:
          classes = 'empty-cell hover:bg-gray-600 transition-colors duration-200';
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
    overlayStyle() {
      return {
        transition: this.animationsEnabled ? 'opacity 0.2s ease, transform 0.2s ease' : 'none',
      };
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
/* Define keyframes for pulsing effect */
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

div {
  width: 20px;
  height: 20px;
  border: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  position: relative;
  overflow: hidden; /* Changed to hidden to clip overlay */
  cursor: pointer;
}

.empty-cell {
  background-color: #374151;
}

.wall-cell {
  background-color: #1F2937;
}

.start-cell {
  background-color: #10B981;
}

.end-cell {
  background-color: #EF4444;
}

/* Overlay styles */
.cell-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: scale(1);
  pointer-events: none;
  background-color: transparent;
}

/* Updated keyframes for path pulsating effect */
@keyframes pathPulse {
  0% {
    background-color: #FBBF24; /* Base yellow */
  }
  50% {
    background-color: #FDE68A; /* Lighter yellow */
  }
  100% {
    background-color: #FBBF24; /* Base yellow */
  }
}

.path-pulsate {
  animation: pathPulse 2s infinite;
}
</style>
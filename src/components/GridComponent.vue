<template>
  <div class="grid-container">
    <div
      class="grid"
      :style="[gridStyle, cursorStyle]"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
    >
      <CellComponent
        v-for="cell in flattenedGrid"
        :key="`${cell.row}-${cell.col}`"
        :cell="cell"
        :isMouseDown="isMouseDown"
        @cellMouseDown="onCellMouseDown"
        @cellMouseEnter="onCellMouseEnter"
        @cellMouseUp="onCellMouseUp"
      />
    </div>
    <div class="controls mt-4 space-y-4">
      <AlgorithmSelector :disabled="isVisualizing" />
      <div class="buttons flex items-center justify-center space-x-2">
        <button
          ref="visualizeBtn"
          class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          @click="visualizeAlgorithm"
          :disabled="!isStartAndEndPlaced || isVisualizing"
        >
          Visualize Algorithm
        </button>
        <button
          ref="clearBtn"
          class="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          @click="clearGrid"
          :disabled="isVisualizing"
        >
          Clear Grid
        </button>
        <button
          ref="resetBtn"
          class="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          @click="onResetGridState"
          :disabled="isVisualizing"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import CellComponent from './CellComponent.vue';
import AlgorithmSelector from './AlgorithmSelector.vue';
import { useGrid } from '@/composables/useGrid';
import { useAlgorithms } from '@/composables/useAlgorithms';
import { useStatus } from '@/composables/useStatus';
import { gsap } from 'gsap';

export default defineComponent({
  name: 'GridComponent',
  components: {
    CellComponent,
    AlgorithmSelector,
  },
  setup() {
    const {
      grid,
      initializeGrid,
      updateCellState,
      resetGrid,
      resetGridState,
      startNode,
      endNode,
    } = useGrid();
    const { selectedAlgorithm, runAlgorithm } = useAlgorithms();
    const { statusMessage } = useStatus();

    const isMouseDown = ref(false);
    const isStartNodePlaced = ref(false);
    const isEndNodePlaced = ref(false);
    const isVisualizing = ref(false);
    const placing = ref<'wall' | null>(null); // Currently, only 'wall' placement is handled

    // Set to track walls added during the current drag
    const newWalls = ref<Set<string>>(new Set());

    // Reactive variable to track the current placing mode: 'add' or 'remove'
    const placingMode = ref<'add' | 'remove' | null>(null);

    initializeGrid();

    const flattenedGrid = computed(() => grid.flat());

    const gridStyle = computed(() => ({
      display: 'grid',
      gridTemplateRows: `repeat(${grid.length}, 20px)`,
      gridTemplateColumns: `repeat(${grid[0].length}, 20px)`,
    }));

    // Computed property to determine cursor style based on placingMode
    const cursorStyle = computed(() => {
      if (placingMode.value === 'add') {
        return {
          cursor: 'crosshair', // Indicates wall addition
        };
      } else if (placingMode.value === 'remove') {
        return {
          cursor: 'not-allowed', // Indicates wall removal
        };
      } else {
        return {
          cursor: 'default', // Default cursor
        };
      }
    });

    const isStartAndEndPlaced = computed(
      () => isStartNodePlaced.value && isEndNodePlaced.value
    );

    function handleMouseDown() {
      isMouseDown.value = true;
    }

    function handleMouseUp() {
      isMouseDown.value = false;
      placing.value = null;
      placingMode.value = null;
      newWalls.value.clear(); // Clear the set after drag is complete
    }

    function handleMouseLeave() {
      isMouseDown.value = false;
      placing.value = null;
      placingMode.value = null;
      newWalls.value.clear(); // Clear the set if mouse leaves the grid during drag
    }

    function onCellMouseDown(row: number, col: number) {
      const cell = grid[row][col];
      const cellKey = `${row}-${col}`; // Unique identifier for the cell

      if (!isStartNodePlaced.value) {
        // Place start node
        updateCellState(row, col, 'start', selectedAlgorithm.value);
        startNode.row = row;
        startNode.col = col;
        isStartNodePlaced.value = true;
        statusMessage.value = 'Start node placed.';
      } else if (!isEndNodePlaced.value) {
        // Place end node
        if (cell.state === 'start') return; // Prevent placing end node on start node
        updateCellState(row, col, 'end', selectedAlgorithm.value);
        endNode.row = row;
        endNode.col = col;
        isEndNodePlaced.value = true;
        statusMessage.value = 'End node placed.';
      } else {
        // Ensure we don't modify start or end nodes
        if (cell.state === 'start' || cell.state === 'end') {
          return;
        }

        // Toggle wall state
        placing.value = 'wall';

        if (cell.state === 'wall') {
          // Initiate wall removal mode
          if (!newWalls.value.has(cellKey)) {
            // Only allow removal if the wall was not added during this drag
            updateCellState(row, col, 'empty', selectedAlgorithm.value);
            placingMode.value = 'remove';
          }
          // If the wall was added during this drag, do not allow removal
        } else {
          // Initiate wall addition mode
          updateCellState(row, col, 'wall', selectedAlgorithm.value);
          newWalls.value.add(cellKey); // Track the new wall
          placingMode.value = 'add';
        }
      }
    }

    function onCellMouseEnter(row: number, col: number) {
      if (isMouseDown.value && placing.value === 'wall') {
        const cell = grid[row][col];
        const cellKey = `${row}-${col}`; // Unique identifier for the cell

        // Ensure we don't modify start or end nodes
        if (cell.state === 'start' || cell.state === 'end') {
          return;
        }

        if (cell.state === 'wall') {
          // Attempt to remove wall
          if (!newWalls.value.has(cellKey)) {
            // Only allow removal if the wall was not added during this drag
            updateCellState(row, col, 'empty', selectedAlgorithm.value);
          }
          // If the wall was added during this drag, do not allow removal
        } else {
          // Attempt to add wall
          updateCellState(row, col, 'wall', selectedAlgorithm.value);
          newWalls.value.add(cellKey); // Track the new wall
        }
      }
    }

    function onCellMouseUp() {
      isMouseDown.value = false;
      placing.value = null;
      placingMode.value = null;
      newWalls.value.clear(); // Clear the set after drag is complete
    }

    function clearGrid() {
      resetGrid();
      isStartNodePlaced.value = false;
      isEndNodePlaced.value = false;
      statusMessage.value = 'Grid cleared. Ready to start.';
    }

    function onResetGridState() {
      resetGridState();
      statusMessage.value = 'Grid reset. You can run the algorithm again.';
    }

    async function visualizeAlgorithm() {
      if (!isStartAndEndPlaced.value) {
        statusMessage.value = 'Please place both the start and end nodes.';
        return;
      }

      isVisualizing.value = true;
      statusMessage.value = `Running ${selectedAlgorithm.value}...`;

      resetGridState();
      await runAlgorithm(grid, startNode, endNode, updateCellState);

      isVisualizing.value = false;
      statusMessage.value = 'Visualization complete.';
    }

    onUnmounted(() => {
      newWalls.value.clear();
      placingMode.value = null;
    });

    // Refs for buttons
    const visualizeBtn = ref<HTMLButtonElement | null>(null);
    const clearBtn = ref<HTMLButtonElement | null>(null);
    const resetBtn = ref<HTMLButtonElement | null>(null);

    onMounted(() => {
      const buttons = [
        { ref: visualizeBtn, name: 'Visualize Algorithm' },
        { ref: clearBtn, name: 'Clear Grid' },
        { ref: resetBtn, name: 'Reset' },
      ];

      buttons.forEach((button) => {
        const btn = button.ref.value;
        if (btn) {
          // Hover animations
          btn.addEventListener('mouseenter', () => {
            if (!btn.disabled) {
              gsap.to(btn, { scale: 1.05, duration: 0.2, ease: 'power1.out' });
            }
          });

          btn.addEventListener('mouseleave', () => {
            if (!btn.disabled) {
              gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power1.out' });
            }
          });

          // Tactile response animations
          btn.addEventListener('mousedown', () => {
            if (!btn.disabled) {
              gsap.to(btn, { scale: 0.95, duration: 0.1, ease: 'power1.out' });
            }
          });

          btn.addEventListener('mouseup', () => {
            if (!btn.disabled) {
              gsap.to(btn, { scale: 1, duration: 0.1, ease: 'power1.out' });
            }
          });

          btn.addEventListener('touchstart', () => {
            if (!btn.disabled) {
              gsap.to(btn, { scale: 0.95, duration: 0.1, ease: 'power1.out' });
            }
          });

          btn.addEventListener('touchend', () => {
            if (!btn.disabled) {
              gsap.to(btn, { scale: 1, duration: 0.1, ease: 'power1.out' });
            }
          });
        }
      });
    });

    return {
      grid,
      flattenedGrid,
      isMouseDown,
      handleMouseDown,
      handleMouseUp,
      handleMouseLeave,
      onCellMouseDown,
      onCellMouseEnter,
      onCellMouseUp,
      gridStyle,
      cursorStyle,
      clearGrid,
      onResetGridState,
      visualizeAlgorithm,
      isStartAndEndPlaced,
      isVisualizing,
      selectedAlgorithm,
      statusMessage,
      // Button refs
      visualizeBtn,
      clearBtn,
      resetBtn,
    };
  },
});
</script>

<style scoped>
.grid-container {
  overflow: visible;
}
.grid {
  margin: 0 auto;
  user-select: none;
}
.controls {
  text-align: center;
}
.buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

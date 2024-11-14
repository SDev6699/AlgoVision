<template>
  <div class="grid-container">
    <div
      class="grid"
      :style="gridStyle"
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
      <AlgorithmSelector />
      <div class="buttons flex items-center justify-center space-x-2">
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded"
          @click="visualizeAlgorithm"
          :disabled="!isStartAndEndPlaced || isVisualizing"
        >
          Visualize Algorithm
        </button>
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded"
          @click="clearGrid"
        >
          Clear Grid
        </button>
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded"
          @click="onResetGridState"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import CellComponent from './CellComponent.vue';
import AlgorithmSelector from './AlgorithmSelector.vue';
import { useGrid } from '@/composables/useGrid';
import { useAlgorithms } from '@/composables/useAlgorithms';
import { useStatus } from '@/composables/useStatus';

export default defineComponent({
  name: 'GridComponent',
  components: {
    CellComponent,
    AlgorithmSelector,
  },
  setup() {
    // Get shared instances of grid and algorithms
    const { grid, initializeGrid, updateCellState, resetGrid, resetGridState: resetGridStateFromUseGrid, startNode, endNode } = useGrid();
    const { selectedAlgorithm, runAlgorithm } = useAlgorithms();
    const { statusMessage } = useStatus(); // Shared instance of statusMessage

    // Reactive properties
    const isMouseDown = ref(false);
    const isStartNodePlaced = ref(false);
    const isEndNodePlaced = ref(false);
    const isVisualizing = ref(false);
    const placing = ref<'start' | 'end' | 'wall' | null>(null);

    // Initialize grid immediately
    initializeGrid();

    // Flattened grid for rendering
    const flattenedGrid = computed(() => grid.flat());

    // Style for the grid
    const gridStyle = computed(() => ({
      display: 'grid',
      gridTemplateRows: `repeat(${grid.length}, 20px)`,
      gridTemplateColumns: `repeat(${grid[0].length}, 20px)`,
    }));

    // Check if both start and end nodes are placed
    const isStartAndEndPlaced = computed(() => isStartNodePlaced.value && isEndNodePlaced.value);

    // Mouse event handlers for cell interaction
    function handleMouseDown() {
      isMouseDown.value = true;
    }

    function handleMouseUp() {
      isMouseDown.value = false;
      placing.value = null;
    }

    function handleMouseLeave() {
      isMouseDown.value = false;
      placing.value = null;
    }

    // Cell click events for placing start, end, and walls
    function onCellMouseDown(row: number, col: number) {
      if (!isStartNodePlaced.value) {
        updateCellState(row, col, 'start');
        startNode.row = row;
        startNode.col = col;
        isStartNodePlaced.value = true;
        statusMessage.value = 'Start node placed.';
      } else if (!isEndNodePlaced.value) {
        if (grid[row][col].state === 'start') return;
        updateCellState(row, col, 'end');
        endNode.row = row;
        endNode.col = col;
        isEndNodePlaced.value = true;
        statusMessage.value = 'End node placed.';
      } else {
        placing.value = 'wall';
        if (grid[row][col].state !== 'start' && grid[row][col].state !== 'end') {
          updateCellState(row, col, 'wall');
        }
      }
    }

    function onCellMouseEnter(row: number, col: number) {
      if (isMouseDown.value && placing.value === 'wall') {
        if (grid[row][col].state !== 'start' && grid[row][col].state !== 'end') {
          updateCellState(row, col, 'wall');
        }
      }
    }

    function onCellMouseUp() {
      isMouseDown.value = false;
      placing.value = null;
    }

    // Clear the grid and reset status message
    function clearGrid() {
      resetGrid();
      isStartNodePlaced.value = false;
      isEndNodePlaced.value = false;
      statusMessage.value = 'Grid cleared. Ready to start.';
    }

    // Reset only the grid state (visited cells) and update status message
    function onResetGridState() {
      resetGridStateFromUseGrid();
      statusMessage.value = 'Grid reset. You can run the algorithm again.';
    }

    // Run the selected pathfinding algorithm with status updates
    async function visualizeAlgorithm() {
      if (!isStartAndEndPlaced.value) {
        statusMessage.value = 'Please place both the start and end nodes.';
        return;
      }

      isVisualizing.value = true;
      statusMessage.value = `Running ${selectedAlgorithm.value}...`;

      onResetGridState();
      await runAlgorithm(grid, startNode, endNode, updateCellState);
      
      isVisualizing.value = false;
      statusMessage.value = 'Visualization complete.';
    }

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
      clearGrid,
      onResetGridState,
      visualizeAlgorithm,
      isStartAndEndPlaced,
      isVisualizing,
      selectedAlgorithm,
      statusMessage, // Export statusMessage to make it reactive in the component
    };
  },
});
</script>

<style scoped>
.grid-container {
  overflow: visible; /* Ensure overflow is visible */
}
.grid {
  margin: 0 auto;
  user-select: none;
}
.controls {
  text-align: center;
}
</style>
<template>
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
    <div class="controls mt-4">
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        @click="visualizeAStar"
        :disabled="!isStartAndEndPlaced"
      >
        Visualize A*
      </button>
      <button
        class="bg-gray-500 text-white px-4 py-2 rounded"
        @click="clearGrid"
      >
        Clear Grid
      </button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import CellComponent from './CellComponent.vue';
  import { useGrid } from '../composables/useGrid';
  import { aStarAlgorithm } from '../algorithms/aStarAlgorithm';
  
  export default defineComponent({
    name: 'GridComponent',
    components: {
      CellComponent,
    },
    setup() {
      const {
        grid,
        initializeGrid,
        updateCellState,
        resetGrid,
        startNode,
        endNode,
      } = useGrid();
  
      const isMouseDown = ref(false);
      const isStartNodePlaced = ref(false);
      const isEndNodePlaced = ref(false);
      const placing = ref<'start' | 'end' | 'wall' | null>(null);
  
      onMounted(() => {
        initializeGrid();
      });
  
      const flattenedGrid = computed(() => grid.flat());
  
      const gridStyle = computed(() => {
        if (!grid.length || !grid[0].length) return {};

        return {
          display: 'grid',
          gridTemplateRows: `repeat(${grid.length}, 20px)`,
          gridTemplateColumns: `repeat(${grid[0].length}, 20px)`,
        };
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
      }
  
      function handleMouseLeave() {
        isMouseDown.value = false;
        placing.value = null;
      }
  
      function onCellMouseDown(row: number, col: number) {
        if (!isStartNodePlaced.value) {
          updateCellState(row, col, 'start');
          startNode.row = row;
          startNode.col = col;
          isStartNodePlaced.value = true;
        } else if (!isEndNodePlaced.value) {
          if (grid[row][col].state === 'start') return;
          updateCellState(row, col, 'end');
          endNode.row = row;
          endNode.col = col;
          isEndNodePlaced.value = true;
        } else {
          placing.value = 'wall';
          if (
            grid[row][col].state !== 'start' &&
            grid[row][col].state !== 'end'
          ) {
            updateCellState(row, col, 'wall');
          }
        }
      }
  
      function onCellMouseEnter(row: number, col: number) {
        if (isMouseDown.value && placing.value === 'wall') {
          if (
            grid[row][col].state !== 'start' &&
            grid[row][col].state !== 'end'
          ) {
            updateCellState(row, col, 'wall');
          }
        }
      }
  
      function onCellMouseUp() {
        isMouseDown.value = false;
        placing.value = null;
      }
  
      function clearGrid() {
        resetGrid();
        isStartNodePlaced.value = false;
        isEndNodePlaced.value = false;
      }
  
      async function visualizeAStar() {
        if (!isStartAndEndPlaced.value) return;
        await aStarAlgorithm(grid, startNode, endNode, updateCellState);
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
        visualizeAStar,
        isStartAndEndPlaced,
      };
    },
  });
  </script>
  
  <style scoped>
  .grid {
    margin: 0 auto;
    user-select: none;
  }
  .controls {
    text-align: center;
  }
  </style>

// src/composables/useGrid.ts

import { reactive, computed } from 'vue';

export type CellState = 'empty' | 'start' | 'end' | 'wall' | 'visited' | 'path';

export interface Cell {
  row: number;
  col: number;
  state: CellState;
  fCost: number;
  gCost: number;
  hCost: number;
  previousNode: Cell | null;
}

export function useGrid() {
  const numRows = 20; // Adjust as needed
  const numCols = 50;

  const grid = reactive<Cell[][]>([]);

  const startNode = reactive({ row: -1, col: -1 });
  const endNode = reactive({ row: -1, col: -1 });

  // Initialize the grid
  function initializeGrid() {
    grid.length = 0; // Clear existing grid
    for (let row = 0; row < numRows; row++) {
      const currentRow: Cell[] = [];
      for (let col = 0; col < numCols; col++) {
        currentRow.push({
          row,
          col,
          state: 'empty',
          fCost: Infinity,
          gCost: Infinity,
          hCost: Infinity,
          previousNode: null,
        });
      }
      grid.push(currentRow);
    }
  }

  // Update the state of a cell
  function updateCellState(row: number, col: number, state: CellState) {
    grid[row][col].state = state;
  }

  // Reset the grid
  function resetGrid() {
    grid.forEach((row) => {
      row.forEach((cell) => {
        cell.state = 'empty';
        cell.fCost = Infinity;
        cell.gCost = Infinity;
        cell.hCost = Infinity;
        cell.previousNode = null;
      });
    });
    startNode.row = -1;
    startNode.col = -1;
    endNode.row = -1;
    endNode.col = -1;
  }

  // Get the grid dimensions
  const gridDimensions = computed(() => ({
    numRows,
    numCols,
  }));

  return {
    grid,
    initializeGrid,
    updateCellState,
    resetGrid,
    startNode,
    endNode,
    gridDimensions,
  };
}

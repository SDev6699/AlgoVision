import { reactive, computed, nextTick } from 'vue';
import { gsap } from 'gsap';
import { selectedAlgorithm } from './useAlgorithms';
import { animationsEnabled } from './useAnimations';

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
        currentRow.push(createCell(row, col));
      }
      grid.push(currentRow);
    }
  }

  function createCell(row: number, col: number): Cell {
    return {
      row,
      col,
      state: 'empty',
      fCost: Infinity,
      gCost: Infinity,
      hCost: Infinity,
      previousNode: null,
    };
  }

  // Update the state of a cell
  function updateCellState(row: number, col: number, state: CellState) {
    const cell = grid[row][col];
    cell.state = state;

    // Use nextTick to ensure the DOM is updated before manipulating the element
    nextTick(() => {
      const cellElement = document.getElementById(`cell-${cell.row}-${cell.col}`);
      if (cellElement) {
        // Remove any inline styles to reset the cell's appearance
        cellElement.style.backgroundColor = '';
        cellElement.style.transform = '';

        // Apply animations based on the new state
        if (state === 'visited') {
          animateVisitedCell(cellElement);
        } else if (state === 'path') {
          animatePathCell(cellElement);
        }
        // No need to animate 'start', 'end', 'wall', 'empty' here
      }
    });
  }

  // Animate the visited cell
  function animateVisitedCell(cellElement: HTMLElement) {
    if (!animationsEnabled.value) return;

    // Get the target color based on the selected algorithm
    const targetColor = getVisitedCellColor();
    gsap.to(cellElement, {
      backgroundColor: targetColor,
      duration: 0.3,
    });
  }

  // Placeholder for animatePathCell function (implement in Task 3)
  function animatePathCell(cellElement: HTMLElement) {
    if (!animationsEnabled.value) return;

    gsap.to(cellElement, {
      backgroundColor: '#FBBF24', // Yellow (Tailwind bg-yellow-500)
      duration: 0.3,
    });
  }

  // Get the target color for the visited cell based on the selected algorithm
  function getVisitedCellColor(): string {
    switch (selectedAlgorithm.value) {
      case 'A*':
        return '#3B82F6'; // Blue (Tailwind bg-blue-500)
      case 'BFS':
        return '#8B5CF6'; // Purple (Tailwind bg-purple-500)
      case 'DFS':
        return '#EC4899'; // Pink (Tailwind bg-pink-500)
      case 'Dijkstra':
        return '#14B8A6'; // Teal (Tailwind bg-teal-500)
      default:
        return '#3B82F6'; // Default to blue
    }
  }

  // Reset the grid completely
  function resetGrid() {
    grid.forEach((row) => {
      row.forEach((cell) => {
        Object.assign(cell, createCell(cell.row, cell.col));
        // Clear inline styles
        clearCellInlineStyles(cell.row, cell.col);
      });
    });
    startNode.row = -1;
    startNode.col = -1;
    endNode.row = -1;
    endNode.col = -1;
  }

  // Reset only the cell states (keep walls)
  function resetGridState() {
    grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.state !== 'wall' && cell.state !== 'start' && cell.state !== 'end') {
          cell.state = 'empty';
          // Clear inline styles
          clearCellInlineStyles(cell.row, cell.col);
        }
        cell.fCost = Infinity;
        cell.gCost = Infinity;
        cell.hCost = Infinity;
        cell.previousNode = null;
      });
    });
  }

  // Function to clear inline styles of a cell
  function clearCellInlineStyles(row: number, col: number) {
    nextTick(() => {
      const cellElement = document.getElementById(`cell-${row}-${col}`);
      if (cellElement) {
        cellElement.style.backgroundColor = '';
        cellElement.style.transform = '';
      }
    });
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
    resetGridState,
    startNode,
    endNode,
    gridDimensions,
  };
}
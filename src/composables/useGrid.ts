import { reactive, computed, nextTick } from 'vue';
import { gsap } from 'gsap';
import { selectedAlgorithm } from './useAlgorithms';
import { animationsEnabled } from './useAnimations';
import { startSequentialGlowLoop, clearSequentialGlowLoop, clearGlowEffects } from './animations';

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
  const numRows = 20;
  const numCols = 50;

  const grid = reactive<Cell[][]>([]);

  const startNode = reactive({ row: -1, col: -1 });
  const endNode = reactive({ row: -1, col: -1 });

  /**
   * Initializes the grid with empty cells.
   */
  function initializeGrid() {
    grid.length = 0;
    for (let row = 0; row < numRows; row++) {
      const currentRow: Cell[] = [];
      for (let col = 0; col < numCols; col++) {
        currentRow.push(createCell(row, col));
      }
      grid.push(currentRow);
    }
  }

  /**
   * Creates a new cell with default properties.
   * @param row - The row index of the cell.
   * @param col - The column index of the cell.
   */
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

  /**
   * Updates the state of a specific cell and triggers animations if applicable.
   * @param row - The row index of the cell.
   * @param col - The column index of the cell.
   * @param state - The new state to set for the cell.
   */
  function updateCellState(row: number, col: number, state: CellState) {
    const cell = grid[row][col];
    cell.state = state;

    nextTick(() => {
      const cellElement = document.getElementById(`cell-${cell.row}-${cell.col}`);
      if (cellElement) {
        // Reset inline styles
        cellElement.style.backgroundColor = '';
        cellElement.style.transform = '';
        cellElement.style.boxShadow = '';

        if (state === 'visited') {
          animateVisitedCell(cellElement);
        } else if (state === 'path') {
          animatePathCell(cellElement);
        }
      }
    });
  }

  /**
   * Animates a visited cell using GSAP.
   * @param cellElement - The HTML element of the cell to animate.
   */
  function animateVisitedCell(cellElement: HTMLElement) {
    if (!animationsEnabled.value) return;

    const targetColor = getVisitedCellColor();
    gsap.to(cellElement, {
      backgroundColor: targetColor,
      duration: 0.3, // Duration matches the sleep in algorithms
      ease: 'power1.inOut',
    });
  }

  /**
   * Animates a path cell to transition smoothly to yellow using GSAP.
   * @param cellElement - The HTML element of the cell to animate.
   */
  function animatePathCell(cellElement: HTMLElement) {
    if (!animationsEnabled.value) return;

    gsap.to(cellElement, {
      backgroundColor: '#FBBF24', // Tailwind's yellow-500
      duration: 0.3, // Smooth transition duration
      ease: 'power1.inOut',
    });
  }

  /**
   * Determines the color for visited cells based on the selected algorithm.
   */
  function getVisitedCellColor(): string {
    switch (selectedAlgorithm.value) {
      case 'A*':
        return '#3B82F6'; // Blue
      case 'BFS':
        return '#8B5CF6'; // Purple
      case 'DFS':
        return '#EC4899'; // Pink
      case 'Dijkstra':
        return '#14B8A6'; // Teal
      default:
        return '#3B82F6';
    }
  }

  /**
   * Resets the entire grid, clearing all cells, nodes, walls, and terminating glow effects.
   */
  function resetGrid() {
    grid.forEach((row) => {
      row.forEach((cell) => {
        Object.assign(cell, createCell(cell.row, cell.col));
        clearCellInlineStyles(cell.row, cell.col);
      });
    });
    startNode.row = -1;
    startNode.col = -1;
    endNode.row = -1;
    endNode.col = -1;

    // Terminate all active glow animations
    clearGlowEffects();
  }

  /**
   * Resets only the grid state (visited cells and paths), retaining walls and nodes.
   */
  function resetGridState() {
    grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.state !== 'wall' && cell.state !== 'start' && cell.state !== 'end') {
          cell.state = 'empty';
          clearCellInlineStyles(cell.row, cell.col);
        }
        cell.fCost = Infinity;
        cell.gCost = Infinity;
        cell.hCost = Infinity;
        cell.previousNode = null;
      });
    });

    // Terminate all active glow animations
    clearGlowEffects();
  }

  /**
   * Clears inline styles from a specific cell.
   * @param row - The row index of the cell.
   * @param col - The column index of the cell.
   */
  function clearCellInlineStyles(row: number, col: number) {
    nextTick(() => {
      const cellElement = document.getElementById(`cell-${row}-${col}`);
      if (cellElement) {
        cellElement.style.backgroundColor = '';
        cellElement.style.transform = '';
        cellElement.style.boxShadow = '';
      }
    });
  }

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
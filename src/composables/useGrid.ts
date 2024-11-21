import { reactive, computed, nextTick } from 'vue';
import type { AlgorithmType } from '@/types/AlgorithmType';
import { animationsEnabled } from './useAnimations';
import { startSequentialGlowLoop, clearGlowEffects, currentGlowTimeline, currentPathCells } from './animations';
import { gsap } from 'gsap';

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
   * Updates the state of a cell and triggers necessary animations or direct style updates.
   */
  function updateCellState(
    row: number,
    col: number,
    state: CellState,
    algorithmType: AlgorithmType
  ) {
    const cell = grid[row][col];
    const previousState = cell.state;
    cell.state = state;

    nextTick(() => {
      const cellElement = document.getElementById(`cell-${cell.row}-${cell.col}`);
      if (cellElement) {
        // Reset any inline styles
        cellElement.style.backgroundColor = ''; // Reset to CSS-defined colors
        cellElement.style.transform = '';
        cellElement.style.boxShadow = '';

        // Handle 'path' state
        if (state === 'path') {
          if (animationsEnabled.value) {
            animatePathCell(cellElement);
          } else {
            cellElement.style.backgroundColor = '#FBBF24'; // Path color
          }
        }

        // Handle 'wall' placement/removal
        if (state === 'wall') {
          if (animationsEnabled.value) {
            animateWallPlacement(cellElement);
          } else {
            cellElement.style.backgroundColor = '#1F2937'; // Wall color
          }
        }

        if (previousState === 'wall' && state === 'empty') {
          if (animationsEnabled.value) {
            animateWallRemoval(cellElement);
          } else {
            cellElement.style.backgroundColor = '#374151'; // Empty cell color
          }
        }

        // Handle 'visited' state
        if (state === 'visited') {
          if (animationsEnabled.value) {
            animateVisitedCell(cellElement, algorithmType);
          } else {
            const targetColor = getVisitedCellColor(algorithmType);
            cellElement.style.backgroundColor = targetColor;
          }
        }

        // Handle 'path' state again for clarity
        else if (state === 'path') {
          if (animationsEnabled.value) {
            animatePathCell(cellElement);
          } else {
            cellElement.style.backgroundColor = '#FBBF24'; // Path color
          }
        }
      }
    });
  }

  /**
   * Animates the placement of a wall.
   */
  function animateWallPlacement(cellElement: HTMLElement) {
    if (!animationsEnabled.value) return;

    gsap.fromTo(
      cellElement,
      { backgroundColor: '#374151' }, // Current 'empty' state color
      {
        backgroundColor: '#1F2937', // Wall color (darker gray)
        duration: 0.3,
        ease: 'power1.inOut',
      }
    );
  }

  /**
   * Animates the removal of a wall.
   */
  function animateWallRemoval(cellElement: HTMLElement) {
    if (!animationsEnabled.value) return;

    gsap.fromTo(
      cellElement,
      { backgroundColor: '#1F2937' }, // Current 'wall' color
      {
        backgroundColor: '#374151', // 'Empty' state color
        duration: 0.3,
        ease: 'power1.inOut',
      }
    );
  }

  function animateVisitedCell(cellElement: HTMLElement, algorithmType: AlgorithmType) {
    if (!animationsEnabled.value) return;

    const targetColor = getVisitedCellColor(algorithmType);
    gsap.to(cellElement, {
      backgroundColor: targetColor,
      duration: 0.3,
      ease: 'power1.inOut',
    });
  }

  function animatePathCell(cellElement: HTMLElement) {
    if (!animationsEnabled.value) return;

    gsap.to(cellElement, {
      backgroundColor: '#FBBF24',
      duration: 0.3,
      ease: 'power1.inOut',
    });
  }

  function getVisitedCellColor(algorithmType: AlgorithmType): string {
    switch (algorithmType) {
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

    clearGlowEffects(); // Ensures glow animations are cleared
    currentPathCells.value = []; // Clear stored path cells
    currentGlowTimeline.value = null; // Clear the glow timeline
  }

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

    clearGlowEffects(); // Ensures glow animations are cleared
    currentPathCells.value = []; // Clear stored path cells
    currentGlowTimeline.value = null; // Clear the glow timeline
  }

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

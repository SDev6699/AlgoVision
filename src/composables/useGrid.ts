import { reactive, computed, nextTick } from 'vue';
import type { AlgorithmType } from '@/types/AlgorithmType';
import {
  animationsEnabled,
  currentGlowTimeline,
  currentPathCells,
  glowSpeedMultiplier,
} from './useAnimations';
import { startSequentialGlowLoop, clearGlowEffects } from './animations';
import { gsap } from 'gsap';
import { sleep } from '@/utils/sleep';

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

  // Define a fixed delay for pacing
  const cellUpdateDelay = 50; // milliseconds

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
  async function updateCellState(
    row: number,
    col: number,
    state: CellState,
    algorithmType: AlgorithmType
  ): Promise<void> {
    const cell = grid[row][col];
    const previousState = cell.state;
    cell.state = state;

    await nextTick();

    const cellElement = document.getElementById(`cell-${cell.row}-${cell.col}`);
    const overlayElement = cellElement?.querySelector('.cell-overlay') as HTMLElement | null;

    if (cellElement && overlayElement) {
      // Reset overlay styles when state changes
      overlayElement.style.opacity = '0';
      overlayElement.style.backgroundColor = 'transparent';
      overlayElement.style.transform = 'scale(1)';
      overlayElement.style.transition = animationsEnabled.value
        ? 'opacity 0.2s ease, transform 0.2s ease'
        : 'none';

      // Handle 'path' state
      if (state === 'path') {
        const targetColor = '#FBBF24'; // Path color (yellow)
        if (animationsEnabled.value) {
          animateVisitedCell(overlayElement, targetColor);
        } else {
          overlayElement.style.opacity = '1';
          overlayElement.style.backgroundColor = targetColor;
        }
      }

      // Handle 'wall' placement/removal
      if (state === 'wall') {
        // Clear overlay styles to ensure wall is visible
        overlayElement.style.opacity = '0';
        overlayElement.style.backgroundColor = 'transparent';

        if (animationsEnabled.value) {
          animateWallPlacement(cellElement);
        } else {
          cellElement.style.transform = 'scale(1)';
        }
      }

      if (
        (previousState === 'wall' || previousState === 'visited' || previousState === 'path') &&
        state === 'empty'
      ) {
        // Clear overlay styles to ensure cell returns to default appearance
        overlayElement.style.opacity = '0';
        overlayElement.style.backgroundColor = 'transparent';
        overlayElement.classList.remove('path-pulsate');

        if (animationsEnabled.value) {
          animateWallRemoval(cellElement);
        } else {
          // Ensure the cell is properly scaled and styled
          cellElement.style.transform = 'scale(1)';
        }
      }

      // Handle 'visited' state
      if (state === 'visited') {
        const targetColor = getVisitedCellColor(algorithmType);
        if (animationsEnabled.value) {
          animateVisitedCell(overlayElement, targetColor);
        } else {
          overlayElement.style.opacity = '1';
          overlayElement.style.backgroundColor = targetColor;
        }
      }
    }

    // Always wait for the fixed delay to control pacing
    await sleep(cellUpdateDelay);
  }

  /**
   * Animates the placement of a wall using scale transform.
   */
  function animateWallPlacement(cellElement: HTMLElement): void {
    gsap.fromTo(
      cellElement,
      { scale: 1 }, // Start from original scale
      {
        scale: 1.1, // Slightly enlarge to indicate wall placement
        duration: 0.3,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1, // Pulsate effect
      }
    );
  }

  /**
   * Animates the removal of a wall by resetting transformations.
   */
  function animateWallRemoval(cellElement: HTMLElement): void {
    gsap.to(cellElement, {
      scale: 1, // Ensure the cell is scaled back to its original size
      duration: 0.3,
      ease: 'power1.inOut',
    });
  }

  /**
   * Animates the visited or path cell.
   */
  function animateVisitedCell(overlayElement: HTMLElement, color: string): void {
    gsap.to(overlayElement, {
      opacity: 1,
      backgroundColor: color,
      duration: 0.2,
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

    glowSpeedMultiplier.value = 1; // Reset speed multiplier
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

    glowSpeedMultiplier.value = 1; // Reset speed multiplier
  }

  function clearCellInlineStyles(row: number, col: number) {
    nextTick(() => {
      const cellElement = document.getElementById(`cell-${row}-${col}`);
      if (cellElement) {
        cellElement.style.transform = 'scale(1)'; // Ensure scale is reset
      }
      const overlayElement = cellElement?.querySelector('.cell-overlay') as HTMLElement | null;
      if (overlayElement) {
        overlayElement.style.opacity = '0';
        overlayElement.style.transform = 'scale(1)';
        overlayElement.style.backgroundColor = 'transparent';
        overlayElement.style.transition = '';
        overlayElement.classList.remove('path-pulsate');
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
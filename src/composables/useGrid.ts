import { reactive, computed, nextTick } from 'vue';
import { gsap } from 'gsap';
import { selectedAlgorithm } from './useAlgorithms';
import { animationsEnabled } from './useAnimations';
import { startGlowEffect } from './animations'; // Updated import

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

  function updateCellState(row: number, col: number, state: CellState) {
    const cell = grid[row][col];
    cell.state = state;

    nextTick(() => {
      const cellElement = document.getElementById(`cell-${cell.row}-${cell.col}`);
      if (cellElement) {
        cellElement.style.backgroundColor = '';
        cellElement.style.transform = '';
        cellElement.style.boxShadow = '';

        if (state === 'visited') {
          animateVisitedCell(cellElement);
        }
      }
    });
  }

  function animateVisitedCell(cellElement: HTMLElement) {
    if (!animationsEnabled.value) return;

    const targetColor = getVisitedCellColor();
    gsap.to(cellElement, {
      backgroundColor: targetColor,
      duration: 0.3,
    });
  }

  function getVisitedCellColor(): string {
    switch (selectedAlgorithm.value) {
      case 'A*':
        return '#3B82F6';
      case 'BFS':
        return '#8B5CF6';
      case 'DFS':
        return '#EC4899';
      case 'Dijkstra':
        return '#14B8A6';
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

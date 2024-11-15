import type { Cell, CellState } from '@/composables/useGrid';
import { sleep } from '@/utils/sleep';
import { startGlowEffectWithDelay } from '@/composables/animations'; // Updated import
import { gsap } from 'gsap';

export async function aStarAlgorithm(
  grid: Cell[][],
  startNode: { row: number; col: number },
  endNode: { row: number; col: number },
  updateCellState: (row: number, col: number, state: CellState) => void,
  statusMessage: { value: string }
) {
  const openSet: Cell[] = [];
  const closedSet: Set<Cell> = new Set();

  const startCell = grid[startNode.row][startNode.col];
  const endCell = grid[endNode.row][endNode.col];

  startCell.gCost = 0;
  startCell.hCost = heuristic(startCell, endCell);
  startCell.fCost = startCell.hCost;

  openSet.push(startCell);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.fCost - b.fCost);
    const currentCell = openSet.shift()!;
    closedSet.add(currentCell);

    if (currentCell === endCell) {
      statusMessage.value = 'Path found!';
      await drawPath(currentCell, updateCellState);
      return;
    }

    const neighbors = getNeighbors(currentCell, grid);
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor) || neighbor.state === 'wall') {
        continue;
      }

      const tentativeGCost = currentCell.gCost + 1;
      if (tentativeGCost < neighbor.gCost) {
        neighbor.gCost = tentativeGCost;
        neighbor.hCost = heuristic(neighbor, endCell);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;
        neighbor.previousNode = currentCell;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
          if (neighbor.state !== 'end') {
            updateCellState(neighbor.row, neighbor.col, 'visited');
            await sleep(10);
          }
        }
      }
    }
  }

  statusMessage.value = 'No path found.';
}

/**
 * Heuristic function using Manhattan distance.
 */
function heuristic(cellA: Cell, cellB: Cell): number {
  return Math.abs(cellA.row - cellB.row) + Math.abs(cellA.col - cellB.col);
}

/**
 * Retrieves all valid neighboring cells (up, down, left, right).
 */
function getNeighbors(cell: Cell, grid: Cell[][]): Cell[] {
  const neighbors: Cell[] = [];
  const { row, col } = cell;
  const numRows = grid.length;
  const numCols = grid[0].length;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < numCols - 1) neighbors.push(grid[row][col + 1]);

  return neighbors;
}

/**
 * Draws the shortest path by updating cell states and applying glow effects.
 */
async function drawPath(
  endCell: Cell,
  updateCellState: (row: number, col: number, state: CellState) => void
) {
  let currentCell: Cell | null = endCell;
  const pathCells: Cell[] = [];

  while (currentCell?.previousNode) {
    if (currentCell.state !== 'start' && currentCell.state !== 'end') {
      pathCells.push(currentCell);
    }
    currentCell = currentCell.previousNode;
  }

  pathCells.reverse();

  // Draw the path with yellow cells
  for (const cell of pathCells) {
    updateCellState(cell.row, cell.col, 'path');
    await sleep(30);
  }

  // Apply glow effect to the path cells with staggered delays
  for (const [index, cell] of pathCells.entries()) {
    const cellElement = document.getElementById(`cell-${cell.row}-${cell.col}`);
    if (cellElement) {
      // Start the glow effect with a slight delay between cells
      startGlowEffectWithDelay(cellElement, index * 100); // 100ms delay between each glow start
    }
  }
}
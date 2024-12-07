import type { Cell, CellState } from '@/composables/useGrid';
import type { Ref } from 'vue';
import { currentPathCells, animationsEnabled } from '@/composables/useAnimations';
import { startSequentialGlowStream } from '@/composables/animations';

/**
 * Implements the Breadth-First Search (BFS) pathfinding algorithm.
 */
export async function bfsAlgorithm(
  grid: Cell[][],
  startNode: { row: number; col: number },
  endNode: { row: number; col: number },
  updateCellState: (
    row: number,
    col: number,
    state: CellState,
    algorithmType: string
  ) => Promise<void>,
  statusMessage: Ref<string>
) {
  const queue: Cell[] = [];
  const visited: Set<Cell> = new Set();
  let nodesVisited = 0;

  const startCell = grid[startNode.row][startNode.col];
  const endCell = grid[endNode.row][endNode.col];

  queue.push(startCell);
  visited.add(startCell);

  while (queue.length > 0) {
    const currentCell = queue.shift()!;
    nodesVisited++;

    if (currentCell === endCell) {
      await drawPath(endCell, updateCellState);
      statusMessage.value = `Path found! Nodes visited: ${nodesVisited}`;
      return;
    }

    const neighbors = getNeighbors(currentCell, grid);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && neighbor.state !== 'wall') {
        neighbor.previousNode = currentCell;
        visited.add(neighbor);
        queue.push(neighbor);

        if (neighbor.state !== 'end') {
          await updateCellState(neighbor.row, neighbor.col, 'visited', 'BFS');
        }
      }
    }
  }

  statusMessage.value = `No path found. Nodes visited: ${nodesVisited}`;
}

/**
 * Retrieves neighbors (up, down, left, right).
 */
function getNeighbors(cell: Cell, grid: Cell[][]): Cell[] {
  const neighbors: Cell[] = [];
  const { row, col } = cell;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}

/**
 * Draws the shortest path and applies the continuous glow stream.
 */
async function drawPath(
  endCell: Cell,
  updateCellState: (
    row: number,
    col: number,
    state: CellState,
    algorithmType: string
  ) => Promise<void>
) {
  let currentCell: Cell | null = endCell;
  const pathCells: Cell[] = [];

  while (currentCell) {
    pathCells.push(currentCell);
    currentCell = currentCell.previousNode;
  }

  // Animate from end to start
  for (const cell of pathCells) {
    if (cell.state !== 'start' && cell.state !== 'end') {
      await updateCellState(cell.row, cell.col, 'path', 'BFS');
    }
  }

  // Reverse for start-to-end direction for glow
  const reversedPathCells = pathCells.slice().reverse();

  const glowElements: HTMLElement[] = reversedPathCells
    .map((cell) => {
      const cellElement = document.getElementById(`cell-${cell.row}-${cell.col}`);
      return cellElement?.querySelector('.cell-overlay') as HTMLElement;
    })
    .filter((el): el is HTMLElement => el !== null);

  currentPathCells.value = glowElements;

  if (animationsEnabled.value && glowElements.length > 0) {
    startSequentialGlowStream(glowElements, 500, 100, 1000);
  }
}

import type { Cell, CellState } from '@/composables/useGrid';
import type { Ref } from 'vue';
import { startSequentialGlowLoop } from '@/composables/animations';
import { currentPathCells, animationsEnabled } from '@/composables/useAnimations';

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
      // Path found
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
 * Retrieves all valid neighboring cells (up, down, left, right).
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
 * Draws the shortest path by updating cell states and applying glow effects.
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

  // Collect path cells including the start node
  while (currentCell) {
    pathCells.push(currentCell);
    currentCell = currentCell.previousNode;
  }

  // Animate from end to start (tracing the path)
  for (const cell of pathCells) {
    if (cell.state !== 'start' && cell.state !== 'end') {
      await updateCellState(cell.row, cell.col, 'path', 'BFS');
    }
  }

  // Reverse pathCells for glowing animation to proceed from start to end
  const reversedPathCells = pathCells.slice().reverse();

  // Retrieve overlay elements for the reversed path cells
  const glowElements: HTMLElement[] = reversedPathCells
    .map((cell) => {
      const cellElement = document.getElementById(`cell-${cell.row}-${cell.col}`);
      return cellElement?.querySelector('.cell-overlay') as HTMLElement;
    })
    .filter((el): el is HTMLElement => el !== null);

  // Store the glow elements in currentPathCells
  currentPathCells.value = glowElements;

  // Initiate the glow animation if animations are enabled
  if (animationsEnabled.value) {
    const glowDuration = 2000; // Total duration of the glow animation
    const repeatDelay = 1000; // Delay between glow loops

    startSequentialGlowLoop(glowElements, glowDuration, repeatDelay);
  }
}
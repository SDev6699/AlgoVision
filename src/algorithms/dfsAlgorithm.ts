import type { Cell, CellState } from '@/composables/useGrid';
import type { Ref } from 'vue';
import { startSequentialGlowLoop } from '@/composables/animations';
import { sleep } from '@/utils/sleep';
import { currentPathCells, animationsEnabled } from '@/composables/useAnimations';

/**
 * Implements the Depth-First Search (DFS) pathfinding algorithm.
 */
export async function dfsAlgorithm(
  grid: Cell[][],
  startNode: { row: number; col: number },
  endNode: { row: number; col: number },
  updateCellState: (
    row: number,
    col: number,
    state: CellState,
    algorithmType: string
  ) => void,
  statusMessage: Ref<string>
) {
  const stack: Cell[] = [];
  const visited: Set<Cell> = new Set();
  let nodesVisited = 0;

  const startCell = grid[startNode.row][startNode.col];
  const endCell = grid[endNode.row][endNode.col];

  stack.push(startCell);
  visited.add(startCell);

  while (stack.length > 0) {
    const currentCell = stack.pop()!;
    nodesVisited++;

    if (currentCell === endCell) {
      // Path found
      await drawPath(endCell, updateCellState);
      statusMessage.value = `Path found! Nodes visited: ${nodesVisited}`;
      return;
    }

    if (currentCell.state !== 'start' && currentCell.state !== 'end') {
      updateCellState(currentCell.row, currentCell.col, 'visited', 'DFS');
      await sleep(10);
    }

    const neighbors = getNeighbors(currentCell, grid);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && neighbor.state !== 'wall') {
        neighbor.previousNode = currentCell;
        visited.add(neighbor);
        stack.push(neighbor);
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
  ) => void
) {
  let currentCell: Cell | null = endCell;
  const pathCells: Cell[] = [];

  // Trace back from end to start to collect path cells
  while (currentCell?.previousNode) {
    if (currentCell.state !== 'start' && currentCell.state !== 'end') {
      pathCells.push(currentCell);
    }
    currentCell = currentCell.previousNode;
  }

  // Ensure there's a valid path to draw
  if (pathCells.length === 0) {
    console.warn('No path cells found to draw.');
    return;
  }

  // Draw the path by updating cell states to 'path' with delays for animation
  for (const cell of pathCells) {
    updateCellState(cell.row, cell.col, 'path', 'DFS');
    await sleep(30); // Delay for smoothness
  }

  // Reverse the path to start the glow from the start node
  const reversedPathCells = [...pathCells].reverse();

  // Retrieve HTML elements for the path cells
  const glowElements: HTMLElement[] = reversedPathCells
    .map((cell) => document.getElementById(`cell-${cell.row}-${cell.col}`))
    .filter((el): el is HTMLElement => el !== null);

  // Store the glow elements in currentPathCells
  currentPathCells.value = glowElements;

  // Initiate the glow animation if animations are enabled
  if (animationsEnabled.value) {
    const glowDuration = 2000; // Total duration of the glow animation
    const repeatDelay = 1000; // Delay between glow loops
    const glowLength = 5; // Number of cells glowing at once

    startSequentialGlowLoop(glowElements, glowDuration, repeatDelay, glowLength);
  }
}
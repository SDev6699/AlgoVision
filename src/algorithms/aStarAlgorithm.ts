import type { Cell, CellState } from '@/composables/useGrid';
import { startSequentialGlowLoop } from '@/composables/animations';
import { currentPathCells, animationsEnabled } from '@/composables/useAnimations';

/**
 * Implements A* pathfinding algorithm.
 */
export async function aStarAlgorithm(
  grid: Cell[][],
  startNode: { row: number; col: number },
  endNode: { row: number; col: number },
  updateCellState: (
    row: number,
    col: number,
    state: CellState,
    algorithmType: string
  ) => Promise<void>,
  statusMessage: { value: string }
) {
  const openSet: Cell[] = [];
  const closedSet: Set<Cell> = new Set();

  const startCell = grid[startNode.row][startNode.col];
  const endCell = grid[endNode.row][endNode.col];

  startCell.gCost = 0;
  startCell.hCost = heuristic(startCell, endCell);
  startCell.fCost = startCell.gCost + startCell.hCost;

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

      const tentativeGCost = currentCell.gCost + 1; // Assuming uniform cost
      if (tentativeGCost < neighbor.gCost) {
        neighbor.gCost = tentativeGCost;
        neighbor.hCost = heuristic(neighbor, endCell);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;
        neighbor.previousNode = currentCell;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
          if (neighbor.state !== 'end') {
            await updateCellState(neighbor.row, neighbor.col, 'visited', 'A*');
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
  updateCellState: (
    row: number,
    col: number,
    state: CellState,
    algorithmType: string
  ) => Promise<void>
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
    await updateCellState(cell.row, cell.col, 'path', 'A*');
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
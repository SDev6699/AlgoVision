import type { Cell, CellState } from '@/composables/useGrid';
import { currentPathCells, animationsEnabled } from '@/composables/useAnimations';
import { startSequentialGlowStream } from '@/composables/animations';

/**
 * Implements the A* pathfinding algorithm.
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
  let nodesVisited = 0;

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
    nodesVisited++;

    if (currentCell === endCell) {
      statusMessage.value = `Path found! Nodes visited: ${nodesVisited}`;
      await drawPath(endCell, updateCellState);
      return;
    }

    const neighbors = getNeighbors(currentCell, grid);
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor) || neighbor.state === 'wall') {
        continue;
      }

      const tentativeGCost = currentCell.gCost + 1; // Uniform cost
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

  statusMessage.value = `No path found. Nodes visited: ${nodesVisited}`;
}

/**
 * Heuristic (Manhattan distance).
 */
function heuristic(cellA: Cell, cellB: Cell): number {
  return Math.abs(cellA.row - cellB.row) + Math.abs(cellA.col - cellB.col);
}

/**
 * Retrieves neighbors (up, down, left, right).
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

  // Animate from end to start (tracing the path)
  for (const cell of pathCells) {
    if (cell.state !== 'start' && cell.state !== 'end') {
      await updateCellState(cell.row, cell.col, 'path', 'A*');
    }
  }

  // Reverse pathCells for glow from start to end
  const reversedPathCells = pathCells.slice().reverse();

  const glowElements: HTMLElement[] = reversedPathCells
    .map((cell) => {
      const cellElement = document.getElementById(`cell-${cell.row}-${cell.col}`);
      return cellElement?.querySelector('.cell-overlay') as HTMLElement;
    })
    .filter((el): el is HTMLElement => el !== null);

  currentPathCells.value = glowElements;

  if (animationsEnabled.value && glowElements.length > 0) {
    // Continuous forward glow stream
    startSequentialGlowStream(glowElements, 500, 100, 1000);
  }
}

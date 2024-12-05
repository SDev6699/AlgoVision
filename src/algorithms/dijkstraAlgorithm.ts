
import type { Cell, CellState } from '@/composables/useGrid';
import type { Ref } from 'vue';
import { startSequentialGlowLoop } from '@/composables/animations';
import { currentPathCells, animationsEnabled } from '@/composables/useAnimations';

/**
 * Implements Dijkstra's pathfinding algorithm.
 */
export async function dijkstraAlgorithm(
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
  const unvisitedNodes: Cell[] = [];
  let nodesVisited = 0;

  // Initialize distances and populate unvisitedNodes
  for (const row of grid) {
    for (const cell of row) {
      cell.gCost = Infinity;
      cell.previousNode = null;
      unvisitedNodes.push(cell);
    }
  }

  const startCell = grid[startNode.row][startNode.col];
  const endCell = grid[endNode.row][endNode.col];

  startCell.gCost = 0;

  while (unvisitedNodes.length > 0) {
    // Sort nodes by gCost (distance from start)
    unvisitedNodes.sort((a, b) => a.gCost - b.gCost);
    const currentCell = unvisitedNodes.shift()!;
    nodesVisited++;

    if (currentCell.state === 'wall') continue;
    if (currentCell.gCost === Infinity) break; // Remaining nodes are inaccessible

    if (currentCell === endCell) {
      // Path found
      await drawPath(endCell, updateCellState);
      statusMessage.value = `Path found! Nodes visited: ${nodesVisited}`;
      return;
    }

    const neighbors = getNeighbors(currentCell, grid);
    for (const neighbor of neighbors) {
      if (neighbor.state === 'wall') continue;
      const distance = currentCell.gCost + 1; // Assuming uniform cost
      if (distance < neighbor.gCost) {
        neighbor.gCost = distance;
        neighbor.previousNode = currentCell;
      }
    }

    if (currentCell.state !== 'start' && currentCell.state !== 'end') {
      await updateCellState(currentCell.row, currentCell.col, 'visited', 'Dijkstra');
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
      await updateCellState(cell.row, cell.col, 'path', 'Dijkstra');
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
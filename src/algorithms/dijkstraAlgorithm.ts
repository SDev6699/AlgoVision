import type { Cell, CellState } from '@/composables/useGrid';
import type { Ref } from 'vue';
import { startSequentialGlowLoop } from '@/composables/animations';
import { sleep } from '@/utils/sleep';

/**
 * Implements Dijkstra's pathfinding algorithm.
 * @param grid - The grid of cells.
 * @param startNode - The start node coordinates.
 * @param endNode - The end node coordinates.
 * @param updateCellState - Function to update the state of a cell.
 * @param statusMessage - Reference to the status message.
 */
export async function dijkstraAlgorithm(
  grid: Cell[][],
  startNode: { row: number; col: number },
  endNode: { row: number; col: number },
  updateCellState: (row: number, col: number, state: CellState) => void,
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
      updateCellState(currentCell.row, currentCell.col, 'visited');
      await sleep(10);
    }
  }

  statusMessage.value = `No path found. Nodes visited: ${nodesVisited}`;
}

/**
 * Retrieves all valid neighboring cells (up, down, left, right).
 * @param cell - The current cell.
 * @param grid - The grid of cells.
 * @returns An array of neighboring cells.
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
 * @param endCell - The end cell of the path.
 * @param updateCellState - Function to update the state of a cell.
 */
async function drawPath(
  endCell: Cell,
  updateCellState: (row: number, col: number, state: CellState) => void
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
    updateCellState(cell.row, cell.col, 'path');
    await sleep(30); // Delay for smoothness
  }

  // Reverse the path to start the glow from the start node
  const reversedPathCells = [...pathCells].reverse();

  // Define animation parameters
  const glowDuration = 300; // Duration of each glow in milliseconds
  const pauseDuration = 2000; // Pause between glow loops in milliseconds

  // Retrieve HTML elements for the path cells
  const glowElements: HTMLElement[] = reversedPathCells
    .map((cell) => document.getElementById(`cell-${cell.row}-${cell.col}`))
    .filter((el): el is HTMLElement => el !== null);

  // Initiate the glow animation
  startSequentialGlowLoop(glowElements, glowDuration, pauseDuration);
}
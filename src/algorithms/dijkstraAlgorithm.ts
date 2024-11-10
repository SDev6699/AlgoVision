import type { Cell, CellState } from '@/composables/useGrid';
import type { Ref } from 'vue';

export async function dijkstraAlgorithm(
  grid: Cell[][],
  startNode: { row: number; col: number },
  endNode: { row: number; col: number },
  updateCellState: (row: number, col: number, state: CellState) => void,
  statusMessage: Ref<string>
) {
  const unvisitedNodes: Cell[] = [];
  let nodesVisited = 0;

  // Initialize distances
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
    // Sort nodes by distance
    unvisitedNodes.sort((a, b) => a.gCost - b.gCost);
    const currentCell = unvisitedNodes.shift()!;
    nodesVisited++;

    if (currentCell.state === 'wall') continue;
    if (currentCell.gCost === Infinity) break;

    if (currentCell === endCell) {
      // Path found
      await drawPath(endCell, updateCellState);
      statusMessage.value = `Path found! Nodes visited: ${nodesVisited}`;
      return;
    }

    const neighbors = getNeighbors(currentCell, grid);
    for (const neighbor of neighbors) {
      if (neighbor.state === 'wall') continue;
      const distance = currentCell.gCost + 1;
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

function getNeighbors(cell: Cell, grid: Cell[][]): Cell[] {
  const neighbors: Cell[] = [];
  const { row, col } = cell;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}

async function drawPath(
  endCell: Cell,
  updateCellState: (row: number, col: number, state: CellState) => void
) {
  let currentCell: Cell | null = endCell;
  while (currentCell?.previousNode) {
    if (currentCell.state !== 'end') {
      updateCellState(currentCell.row, currentCell.col, 'path');
      await sleep(30);
    }
    currentCell = currentCell.previousNode;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
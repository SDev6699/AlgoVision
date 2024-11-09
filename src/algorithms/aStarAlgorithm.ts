// src/algorithms/aStarAlgorithm.ts

import type { Cell, CellState } from '../composables/useGrid';

export async function aStarAlgorithm(
  grid: Cell[][],
  startNode: { row: number; col: number },
  endNode: { row: number; col: number },
  updateCellState: (row: number, col: number, state: CellState) => void
) {
  const openSet: Cell[] = [];
  const closedSet: Cell[] = [];

  const startCell = grid[startNode.row][startNode.col];
  const endCell = grid[endNode.row][endNode.col];

  startCell.gCost = 0;
  startCell.hCost = heuristic(startCell, endCell);
  startCell.fCost = startCell.hCost;

  openSet.push(startCell);

  while (openSet.length > 0) {
    // Sort openSet by fCost
    openSet.sort((a, b) => a.fCost - b.fCost);
    const currentCell = openSet.shift()!;
    closedSet.push(currentCell);

    if (currentCell === endCell) {
      // Path found
      await drawPath(endCell, updateCellState);
      return;
    }

    const neighbors = getNeighbors(currentCell, grid);
    for (const neighbor of neighbors) {
      if (
        closedSet.includes(neighbor) ||
        neighbor.state === 'wall'
      ) {
        continue;
      }
      const tentativeGCost = currentCell.gCost + 1;
      if (tentativeGCost < neighbor.gCost) {
        neighbor.previousNode = currentCell;
        neighbor.gCost = tentativeGCost;
        neighbor.hCost = heuristic(neighbor, endCell);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
          if (neighbor.state !== 'end') {
            updateCellState(neighbor.row, neighbor.col, 'visited');
            await sleep(10); // Adjust speed as needed
          }
        }
      }
    }
  }

  alert('No path found');
}

function heuristic(a: Cell, b: Cell): number {
  // Manhattan distance
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
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
      await sleep(30); // Adjust speed as needed
    }
    currentCell = currentCell.previousNode;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

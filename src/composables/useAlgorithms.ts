import { ref } from 'vue';
import type { Cell, CellState } from '@/composables/useGrid';
import { aStarAlgorithm } from '@/algorithms/aStarAlgorithm';
import { bfsAlgorithm } from '@/algorithms/bfsAlgorithm';
import { dfsAlgorithm } from '@/algorithms/dfsAlgorithm';
import { dijkstraAlgorithm } from '@/algorithms/dijkstraAlgorithm';
import { useStatus } from '@/composables/useStatus';
import type { AlgorithmType } from '@/types/AlgorithmType';

// Export selectedAlgorithm so it can be imported elsewhere
export const selectedAlgorithm = ref<AlgorithmType>('A*');

export function useAlgorithms() {
  const { statusMessage } = useStatus();

  /**
   * Runs the selected pathfinding algorithm.
   * @param grid - The grid of cells.
   * @param startNode - The start node coordinates.
   * @param endNode - The end node coordinates.
   * @param updateCellStateBase - The base function to update cell state.
   */
  async function runAlgorithm(
    grid: Cell[][],
    startNode: { row: number; col: number },
    endNode: { row: number; col: number },
    updateCellStateBase: (
      row: number,
      col: number,
      state: CellState,
      algorithmType: AlgorithmType
    ) => Promise<void>
  ) {
    const algorithmType = selectedAlgorithm.value;
    statusMessage.value = `Running ${algorithmType}...`;

    // Create a wrapper function that includes algorithmType
    const updateCellState = (row: number, col: number, state: CellState) => {
      return updateCellStateBase(row, col, state, algorithmType);
    };

    switch (algorithmType) {
      case 'A*':
        await aStarAlgorithm(grid, startNode, endNode, updateCellState, statusMessage);
        break;
      case 'BFS':
        await bfsAlgorithm(grid, startNode, endNode, updateCellState, statusMessage);
        break;
      case 'DFS':
        await dfsAlgorithm(grid, startNode, endNode, updateCellState, statusMessage);
        break;
      case 'Dijkstra':
        await dijkstraAlgorithm(grid, startNode, endNode, updateCellState, statusMessage);
        break;
      default:
        statusMessage.value = 'Algorithm not implemented';
        break;
    }
  }

  return {
    selectedAlgorithm, // This refers to the globally shared ref
    runAlgorithm,
  };
}
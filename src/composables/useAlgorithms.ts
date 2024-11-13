import { ref } from 'vue';
import type { Cell, CellState } from '@/composables/useGrid';
import { aStarAlgorithm } from '@/algorithms/aStarAlgorithm';
import { bfsAlgorithm } from '@/algorithms/bfsAlgorithm';
import { dfsAlgorithm } from '@/algorithms/dfsAlgorithm';
import { dijkstraAlgorithm } from '@/algorithms/dijkstraAlgorithm';
import { useStatus } from '@/composables/useStatus';

// Export selectedAlgorithm so it can be imported elsewhere
export type AlgorithmType = 'A*' | 'BFS' | 'DFS' | 'Dijkstra';

export const selectedAlgorithm = ref<AlgorithmType>('A*');

export function useAlgorithms() {
  const { statusMessage } = useStatus();

  async function runAlgorithm(
    grid: Cell[][],
    startNode: { row: number; col: number },
    endNode: { row: number; col: number },
    updateCellState: (row: number, col: number, state: CellState) => void
  ) {
    statusMessage.value = `Running ${selectedAlgorithm.value}...`;
    switch (selectedAlgorithm.value) {
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
    selectedAlgorithm, // This will now refer to the globally shared ref
    runAlgorithm,
  };
}
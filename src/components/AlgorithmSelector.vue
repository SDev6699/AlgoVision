<template>
  <div class="flex items-center justify-center space-x-4">
    <label for="algorithm" class="text-white">Select Algorithm:</label>
    <select
      id="algorithm"
      v-model="selectedAlgorithm"
      :disabled="disabled"
      class="bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="A*">A*</option>
      <option value="Dijkstra">Dijkstra's</option>
      <option value="BFS">Breadth-First Search</option>
      <option value="DFS">Depth-First Search</option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, PropType } from 'vue';
import { useAlgorithms } from '@/composables/useAlgorithms';

export default defineComponent({
  name: 'AlgorithmSelector',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { selectedAlgorithm } = useAlgorithms();

    // Watch for changes in selectedAlgorithm to confirm updates
    watch(selectedAlgorithm, (newValue) => {
      console.log(`Algorithm changed to: ${newValue}`);
    });

    return {
      selectedAlgorithm,
      disabled: props.disabled,
    };
  },
});
</script>

<style scoped>
/* Add any necessary styles */
</style>
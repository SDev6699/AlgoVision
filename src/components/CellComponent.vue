<template>
  <div
    :id="`cell-${cell.row}-${cell.col}`"
    :class="cellClass"
    @mousedown="handleMouseDown"
    @mouseenter="handleMouseEnter"
    @mouseup="handleMouseUp"
  >
    <span v-if="cell.state === 'start'" class="text-white">S</span>
    <span v-else-if="cell.state === 'end'" class="text-white">E</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useAlgorithms } from '@/composables/useAlgorithms';
import type { CellState } from '@/composables/useGrid';

export default defineComponent({
  name: 'CellComponent',
  props: {
    cell: {
      type: Object as PropType<{
        row: number;
        col: number;
        state: CellState;
      }>,
      required: true,
    },
    isMouseDown: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const { selectedAlgorithm } = useAlgorithms();
    return {
      selectedAlgorithm,
    };
  },
  computed: {
    cellClass(): string {
      switch (this.cell.state) {
        case 'start':
          return 'bg-green-500 flex items-center justify-center';
        case 'end':
          return 'bg-red-500 flex items-center justify-center';
        case 'wall':
          return 'bg-gray-800';
        case 'visited':
          return ''; // No background color class; GSAP handles it
        case 'path':
          return 'bg-yellow-500';
        default:
          return 'bg-gray-700';
      }
    },
  },
  methods: {
    handleMouseDown() {
      this.$emit('cellMouseDown', this.cell.row, this.cell.col);
    },
    handleMouseEnter() {
      if (this.isMouseDown) {
        this.$emit('cellMouseEnter', this.cell.row, this.cell.col);
      }
    },
    handleMouseUp() {
      this.$emit('cellMouseUp');
    },
  },
});
</script>

<style scoped>
div {
  width: 20px;
  height: 20px;
  border: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  /* Remove background-color to prevent overriding class styles */
}
</style>
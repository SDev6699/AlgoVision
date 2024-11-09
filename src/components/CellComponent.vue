<!-- src/components/CellComponent.vue -->

<template>
    <div
      :class="cellClass"
      @mousedown="handleMouseDown"
      @mouseenter="handleMouseEnter"
      @mouseup="handleMouseUp"
    >
      <!-- Optional: Add icons or labels for start/end nodes -->
      <span v-if="cell.state === 'start'" class="text-white">S</span>
      <span v-else-if="cell.state === 'end'" class="text-white">E</span>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import type { CellState } from '../composables/useGrid';
  
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
            return 'bg-blue-500';
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
    border: 1px solid #374151; /* Tailwind's gray-700 */
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }
  </style>
  
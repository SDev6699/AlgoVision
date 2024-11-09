<!-- src/App.vue -->

<template>
  <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
    <h1 class="text-3xl text-white mb-4">Pathfinding Visualizer</h1>
    <GridComponent />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GridComponent from './components/GridComponent.vue';

export default defineComponent({
  name: 'App',
  components: {
    GridComponent,
  },
});
</script>

<style>
/* Global styles can go here */
</style>

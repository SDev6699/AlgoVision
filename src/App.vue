<!-- src/App.vue -->
<template>
  <div id="app" class="min-h-screen bg-gray-900">
    <Main />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Main from './components/Main.vue';

export default defineComponent({
  name: 'App',
  components: {
    Main,
  },
});
</script>

<style>
/* Global styles */
</style>

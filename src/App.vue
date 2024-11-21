<template>
  <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative">
    <h1 class="text-3xl text-white mb-4">Pathfinding Visualizer</h1>
    <GridComponent />
    <StatusBar />
    <FAB @toggle="toggleControlPanel" />
    <ControlPanel v-if="isControlPanelOpen" @close="toggleControlPanel" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import GridComponent from './components/GridComponent.vue';
import StatusBar from './components/StatusBar.vue';
import FAB from './components/FAB.vue';
import ControlPanel from './components/ControlPanel.vue';

export default defineComponent({
  name: 'App',
  components: {
    GridComponent,
    StatusBar,
    FAB,
    ControlPanel,
  },
  setup() {
    const isControlPanelOpen = ref(false);

    /**
     * Toggles the visibility of the control panel.
     */
    function toggleControlPanel() {
      isControlPanelOpen.value = !isControlPanelOpen.value;
    }

    return {
      isControlPanelOpen,
      toggleControlPanel,
    };
  },
});
</script>

<style>
/* Global styles can go here */
</style>
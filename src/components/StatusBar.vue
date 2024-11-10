<template>
  <div class="bg-gray-800 text-white px-4 py-2 fixed bottom-0 w-full text-center">
    <p>{{ statusMessage }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStatus } from '@/composables/useStatus';

export default defineComponent({
  name: 'StatusBar',
  setup() {
    const { statusMessage } = useStatus();
    return {
      statusMessage,
    };
  },
});
</script>

<style scoped>
/* Add any necessary styles */
</style>

import { ref } from 'vue';

// Single instance of statusMessage, like a global store
const statusMessage = ref('Ready');

export function useStatus() {
  return {
    statusMessage,
  };
}
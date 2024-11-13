import { ref } from 'vue';

// Reactive reference to manage whether animations are enabled
export const animationsEnabled = ref(true);

export function useAnimations() {
  return {
    animationsEnabled,
  };
}
import { ref } from 'vue';

export const animationsEnabled = ref(true);

/**
 * Toggles the animations on or off.
 */
export function toggleAnimations() {
  animationsEnabled.value = !animationsEnabled.value;
}
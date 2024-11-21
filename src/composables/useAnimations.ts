// src/composables/useAnimations.ts

import { ref } from 'vue';
import { gsap } from 'gsap';

export const animationsEnabled = ref(true);

// Stores the HTML elements of the current path cells
export const currentPathCells = ref<HTMLElement[]>([]);

// Stores the current glow timeline
export const currentGlowTimeline = ref<gsap.core.Timeline | null>(null);

// Multiplier to control the speed of the glow animation
export const glowSpeedMultiplier = ref(1);

/**
 * Toggles the animations on or off.
 * When re-enabled, increases the glow speed.
 */
export function toggleAnimations() {
  animationsEnabled.value = !animationsEnabled.value;

  if (animationsEnabled.value) {
    // Increase the speed by 50% each time animations are re-enabled
    glowSpeedMultiplier.value *= 1.5;
  }
}

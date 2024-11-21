import { ref } from 'vue';
import { gsap } from 'gsap';

export const animationsEnabled = ref(true);
export const currentPathCells = ref<HTMLElement[]>([]);

// Added to store the current glow timeline
export const currentGlowTimeline = ref<gsap.core.Timeline | null>(null);

/**
 * Toggles the animations on or off.
 */
export function toggleAnimations() {
  animationsEnabled.value = !animationsEnabled.value;
}

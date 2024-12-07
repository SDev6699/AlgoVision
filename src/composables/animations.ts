import { ref } from 'vue';
import { gsap } from 'gsap';

export const animationsEnabled = ref(true);
export const currentPathCells = ref<HTMLElement[]>([]);
export const currentGlowTimeline = ref<gsap.core.Timeline | null>(null);
export const glowSpeedMultiplier = ref(1);

/**
 * Clears any active glow animations.
 */
export function clearGlowEffects() {
  if (currentGlowTimeline.value) {
    currentGlowTimeline.value.kill();
    currentGlowTimeline.value = null;
  }
  currentPathCells.value.forEach((el) => {
    gsap.killTweensOf(el);
    el.style.opacity = '1'; 
    el.style.backgroundColor = '#FBBF24'; // Reset to base yellow path color
  });
  currentPathCells.value = [];
}

/**
 * Creates a smooth one-directional stream of glow from the start cell to the end cell,
 * and continuously loops this stream. Once it finishes glowing through all cells,
 * it restarts from the first cell again.
 *
 * @param elements Path cells in start-to-end order.
 * @param baseDuration Duration (in ms) each cell stays highlighted before reverting.
 * @param stagger Time (in ms) between starting the glow on consecutive cells.
 * @param repeatDelay Time (in ms) to wait before starting the glow sequence again after it finishes.
 */
export function startSequentialGlowStream(
  elements: HTMLElement[],
  baseDuration: number = 500,
  stagger: number = 100,
  repeatDelay: number = 1000
) {
  // Clear any existing timeline
  if (currentGlowTimeline.value) {
    currentGlowTimeline.value.kill();
    currentGlowTimeline.value = null;
  }

  const adjustedDuration = baseDuration / glowSpeedMultiplier.value;
  const timeline = gsap.timeline({ repeat: -1, repeatDelay: repeatDelay / 1000 });

  elements.forEach((el, index) => {
    const startTime = (index * stagger) / 1000; // Convert ms to s

    // Phase 1: Fade into a lighter highlight color
    timeline.to(el, {
      backgroundColor: '#FDE68A', // Lighter highlight color
      duration: adjustedDuration / 1000,
      ease: 'power1.inOut',
    }, startTime);

    // Phase 2: Fade back to the original path color
    timeline.to(el, {
      backgroundColor: '#FBBF24', // Original path color
      duration: adjustedDuration / 1000,
      ease: 'power1.inOut',
    }, startTime + (adjustedDuration / 1000));
  });

  currentGlowTimeline.value = timeline;
}

import { ref } from 'vue';
import { gsap } from 'gsap';

export const animationsEnabled = ref(true);
export const currentPathCells = ref<HTMLElement[]>([]);
export const currentGlowTimeline = ref<gsap.core.Timeline | null>(null);
export const glowSpeedMultiplier = ref(1);

/**
 * Starts a sequential glow animation along the path cells from start to end.
 */
export function startSequentialGlowLoop(
  elements: HTMLElement[],
  duration: number,
  repeatDelay: number
) {
  // Clear any existing timeline
  if (currentGlowTimeline.value) {
    currentGlowTimeline.value.kill();
    currentGlowTimeline.value = null;
  }

  const totalDuration = duration / glowSpeedMultiplier.value;
  const individualDuration = totalDuration / elements.length;

  const timeline = gsap.timeline({ repeat: -1, repeatDelay: repeatDelay / 1000 });

  elements.forEach((el, index) => {
    timeline.to(
      el,
      {
        backgroundColor: '#FDE68A', // Lighter yellow
        duration: individualDuration / 1000,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      },
      index * (individualDuration / 1000) // Start time for each element
    );
  });

  currentGlowTimeline.value = timeline;
}

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
    el.style.opacity = '1'; // Reset opacity
    el.style.backgroundColor = '#FBBF24'; // Reset to base yellow
  });
  currentPathCells.value = [];
}
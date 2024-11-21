import { ref } from 'vue';
import { gsap } from 'gsap';

export const animationsEnabled = ref(true);

// Exported to store the current path cells involved in the glowing animation
export const currentPathCells = ref<HTMLElement[]>([]);

// Exported to store the current glow timeline
export const currentGlowTimeline = ref<gsap.core.Timeline | null>(null);

/**
 * Starts a sequential glow loop that flows from start to end.
 */
export function startSequentialGlowLoop(
  pathCells: HTMLElement[],
  glowDuration: number = 300,
  repeatDelay: number = 2000
) {
  if (!animationsEnabled.value) return; // Prevent starting animations if disabled

  // If a glow timeline already exists, resume it
  if (currentGlowTimeline.value) {
    currentGlowTimeline.value.resume();
    return;
  }

  // Create a new timeline for the sequential glow loop
  const glowTimeline = gsap.timeline({
    repeat: -1, // Infinite repeats
    repeatDelay: repeatDelay / 1000, // Convert ms to seconds
  });

  pathCells.forEach((cell) => {
    glowTimeline.fromTo(
      cell,
      { boxShadow: '0 0 0px 0px rgba(255, 255, 0, 0.0)' },
      {
        boxShadow: '0 0 15px 10px rgba(255, 255, 0, 0.5)',
        duration: glowDuration / 1000, // Convert ms to seconds
        ease: 'sine.inOut',
      }
    ).to(
      cell,
      {
        boxShadow: '0 0 0px 0px rgba(255, 255, 0, 0.0)',
        duration: glowDuration / 1000,
        ease: 'sine.inOut',
      }
    );
  });

  // Store the timeline
  currentGlowTimeline.value = glowTimeline;
}

/**
 * Clears the glow effect by pausing the timeline and resetting cell styles.
 */
export function clearGlowEffects() {
  if (currentGlowTimeline.value) {
    currentGlowTimeline.value.pause();

    // Reset the boxShadow styles of the cells
    if (currentPathCells.value.length > 0) {
      currentPathCells.value.forEach((cell) => {
        cell.style.boxShadow = 'none';
      });
    }
  }
}

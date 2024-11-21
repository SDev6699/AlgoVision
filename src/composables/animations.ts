import { animationsEnabled, currentGlowTimeline, currentPathCells, glowSpeedMultiplier } from './useAnimations';
import { gsap } from 'gsap';

/**
 * Starts a smooth glow animation that moves along the path cells.
 * @param pathCells - Array of HTMLElements representing the path.
 * @param glowDuration - Total duration of the glow animation in milliseconds.
 * @param repeatDelay - Delay between glow loops in milliseconds.
 * @param glowLength - Number of cells that glow at once.
 */
export function startSequentialGlowLoop(
  pathCells: HTMLElement[],
  glowDuration: number = 2000,
  repeatDelay: number = 1000,
  glowLength: number = 5 // Number of cells glowing at once
) {
  if (!animationsEnabled.value) return; // Do not start if animations are disabled

  // If a glow timeline already exists, adjust its speed and resume
  if (currentGlowTimeline.value) {
    currentGlowTimeline.value.timeScale(glowSpeedMultiplier.value);
    currentGlowTimeline.value.resume();
    return;
  }

  // Adjust durations based on the glow speed multiplier
  const adjustedGlowDuration = glowDuration / glowSpeedMultiplier.value;
  const adjustedRepeatDelay = repeatDelay / glowSpeedMultiplier.value;

  // Create a new timeline for the glowing path
  const glowTimeline = gsap.timeline({
    repeat: -1, // Infinite repeats
    repeatDelay: adjustedRepeatDelay / 1000, // Convert ms to seconds
  });

  // Calculate the duration for each cell's glow
  const totalDurationSeconds = adjustedGlowDuration / 1000; // Total duration in seconds
  const eachDuration = totalDurationSeconds / pathCells.length; // Duration per cell

  // Animate the glow moving along the path
  glowTimeline.to(pathCells, {
    boxShadow: '0 0 15px 10px rgba(255, 255, 0, 0.5)',
    duration: eachDuration,
    ease: 'power1.inOut',
    stagger: {
      each: eachDuration / glowLength, // Overlap glows to have glowLength cells glowing at once
      from: 'start',
      amount: 0,
    },
  });

  // Reverse the glow
  glowTimeline.to(pathCells, {
    boxShadow: '0 0 0px 0px rgba(255, 255, 0, 0.0)',
    duration: eachDuration,
    ease: 'power1.inOut',
    stagger: {
      each: eachDuration / glowLength,
      from: 'start',
      amount: 0,
    },
  });

  // Adjust the time scale of the timeline based on the speed multiplier
  glowTimeline.timeScale(glowSpeedMultiplier.value);

  // Store the timeline
  currentGlowTimeline.value = glowTimeline;
}

/**
 * Clears the glow effect by pausing and killing the timeline and resetting cell styles.
 */
export function clearGlowEffects() {
  if (currentGlowTimeline.value) {
    currentGlowTimeline.value.pause();
    currentGlowTimeline.value.kill();

    // Reset the boxShadow styles of the cells
    if (currentPathCells.value.length > 0) {
      currentPathCells.value.forEach((cell) => {
        cell.style.boxShadow = 'none';
      });
    }

    currentGlowTimeline.value = null;
  }
}
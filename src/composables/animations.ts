import { animationsEnabled } from './useAnimations';
import { gsap } from 'gsap';

// Map to keep track of active glow timelines by unique identifiers
const activeGlowTimelines: Map<string, gsap.core.Timeline> = new Map();

/**
 * Starts a sequential glow loop that flows from start to end.
 * Each glow starts after the previous one completes.
 * After completing the sequence, waits for a specified pause before repeating.
 * @param pathCells - Array of HTML elements representing the path cells.
 * @param glowDuration - Duration of each glow animation in milliseconds.
 * @param repeatDelay - Delay before the glow sequence repeats, in milliseconds.
 */
export function startSequentialGlowLoop(
  pathCells: HTMLElement[],
  glowDuration: number = 300,
  repeatDelay: number = 2000
) {
  if (!animationsEnabled.value) return;

  // Unique identifier for the sequential glow timeline
  const timelineId = 'sequentialGlow';

  // If a sequential glow timeline already exists, kill it before creating a new one
  if (activeGlowTimelines.has(timelineId)) {
    const existingTimeline = activeGlowTimelines.get(timelineId);
    existingTimeline?.kill();
    activeGlowTimelines.delete(timelineId);
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

  // Store the timeline with its unique identifier
  activeGlowTimelines.set(timelineId, glowTimeline);
}

/**
 * Clears the sequential glow loop if it exists.
 */
export function clearSequentialGlowLoop() {
  const timelineId = 'sequentialGlow';
  const timeline = activeGlowTimelines.get(timelineId);
  if (timeline) {
    timeline.kill();
    activeGlowTimelines.delete(timelineId);
  }
}

/**
 * Clears all active glow effects by killing their timelines and clearing pending timeouts.
 */
export function clearGlowEffects() {
  // Kill all active timelines
  activeGlowTimelines.forEach((timeline) => timeline.kill());
  activeGlowTimelines.clear();
}
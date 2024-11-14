import { animationsEnabled } from './useAnimations';
import { gsap } from 'gsap';

// Map to keep track of active glow timelines by cell ID
const activeGlowTimelines: Map<string, gsap.core.Timeline> = new Map();

// Array to keep track of pending glow timeouts
const glowTimeouts: number[] = [];

/**
 * Starts a glow effect on the specified cell element.
 * Prevents multiple timelines on the same cell.
 * @param cellElement - The HTML element of the cell to animate.
 */
export function startGlowEffect(cellElement: HTMLElement) {
  if (!animationsEnabled.value) return;

  const cellId = cellElement.id;

  // If a glow effect is already active on this cell, do nothing
  if (activeGlowTimelines.has(cellId)) return;

  // Create a new timeline for the glow effect
  const glowTimeline = gsap.timeline({ repeat: -1, yoyo: true });

  glowTimeline.fromTo(
    cellElement,
    { boxShadow: '0 0 0px 0px rgba(255, 255, 0, 0.0)' },
    {
      boxShadow: '0 0 15px 10px rgba(255, 255, 0, 0.5)',
      duration: 0.5,
      ease: 'sine.inOut',
    }
  );

  // Store the timeline with the cell ID as the key
  activeGlowTimelines.set(cellId, glowTimeline);
}

/**
 * Starts a glow effect on the specified cell element after a delay.
 * Tracks the timeout ID to allow for clearing.
 * @param cellElement - The HTML element of the cell to animate.
 * @param delay - The delay in milliseconds before starting the glow.
 */
export function startGlowEffectWithDelay(cellElement: HTMLElement, delay: number) {
  if (!animationsEnabled.value) return;

  const timeoutId = window.setTimeout(() => {
    startGlowEffect(cellElement);
  }, delay);

  glowTimeouts.push(timeoutId);
}

/**
 * Clears all active glow effects by killing their timelines and clearing pending timeouts.
 */
export function clearGlowEffects() {
  // Kill all active timelines
  activeGlowTimelines.forEach((timeline) => timeline.kill());
  activeGlowTimelines.clear();

  // Clear all pending timeouts
  glowTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  glowTimeouts.length = 0; // Reset the array
}
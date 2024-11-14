import { animationsEnabled } from './useAnimations';
import { gsap } from 'gsap';

export function startGlowEffect(cellElement: HTMLElement) {
  if (!animationsEnabled.value) return;

  // Glow in and out
  gsap.fromTo(
    cellElement,
    { boxShadow: '0 0 0px 0px rgba(255, 255, 0, 0.0)' },
    {
      boxShadow: '0 0 15px 10px rgba(255, 255, 0, 0.5)',
      duration: 0.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1, // Infinite loop
    }
  );
}

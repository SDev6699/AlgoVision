<template>
  <button
    ref="fabButton"
    class="fab bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg focus:outline-none"
    @click="toggleControlPanel"
    aria-label="Open Settings"
  >
    ⚙️
  </button>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { gsap } from 'gsap';

export default defineComponent({
  name: 'FAB',
  emits: ['toggle'],
  setup(props, { emit }) {
    // Updated the type here
    const fabButton = ref<HTMLButtonElement | null>(null);

    /**
     * Emits the 'toggle' event to open/close the control panel.
     */
    function toggleControlPanel() {
      emit('toggle');
    }

    /**
     * Sets up GSAP hover and tactile response animations for the FAB.
     */
    onMounted(() => {
      const btn = fabButton.value;
      if (btn) {
        // Hover animations
        btn.addEventListener('mouseenter', () => {
          if (!btn.disabled) {
            gsap.to(btn, { scale: 1.1, duration: 0.2, ease: 'power1.out' });
          }
        });

        btn.addEventListener('mouseleave', () => {
          if (!btn.disabled) {
            gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power1.out' });
          }
        });

        // Tactile response animations
        btn.addEventListener('mousedown', () => {
          if (!btn.disabled) {
            gsap.to(btn, { scale: 0.95, duration: 0.1, ease: 'power1.out' });
          }
        });

        btn.addEventListener('mouseup', () => {
          if (!btn.disabled) {
            gsap.to(btn, { scale: 1, duration: 0.1, ease: 'power1.out' });
          }
        });

        btn.addEventListener('touchstart', () => {
          if (!btn.disabled) {
            gsap.to(btn, { scale: 0.95, duration: 0.1, ease: 'power1.out' });
          }
        });

        btn.addEventListener('touchend', () => {
          if (!btn.disabled) {
            gsap.to(btn, { scale: 1, duration: 0.1, ease: 'power1.out' });
          }
        });
      }
    });

    return {
      fabButton,
      toggleControlPanel,
    };
  },
});
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: 24px; /* Adjust spacing from bottom */
  right: 24px;  /* Adjust spacing from right */
  z-index: 1000; /* Ensure it stays above other elements */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.fab:hover {
  background-color: #2563eb; /* Darker blue on hover */
}
</style>

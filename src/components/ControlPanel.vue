<template>
    <div
      ref="controlPanel"
      class="control-panel bg-gray-800 text-white fixed top-0 right-0 h-full w-80 shadow-lg z-1100"
      aria-hidden="true"
    >
      <div class="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 class="text-xl font-semibold">Settings</h2>
        <button
          @click="closePanel"
          class="text-white focus:outline-none"
          aria-label="Close Settings"
        >
          ✖️
        </button>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <label for="animations" class="text-lg">Enable Animations</label>
          <input
            id="animations"
            type="checkbox"
            v-model="animationsEnabled"
            class="toggle-checkbox"
          />
        </div>
        <!-- Add more settings here as needed -->
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue';
  import { gsap } from 'gsap';
  import { animationsEnabled } from '@/composables/useAnimations';
  import { clearGlowEffects } from '@/composables/animations'; // Import clearGlowEffects
  
  export default defineComponent({
    name: 'ControlPanel',
    emits: ['close'],
    setup(props, { emit }) {
      const controlPanel = ref<HTMLElement | null>(null);
  
      /**
       * Closes the control panel by emitting a 'close' event.
       */
      function closePanel() {
        emit('close');
      }
  
      /**
       * Watch for changes in animationsEnabled and toggle animations accordingly.
       * When animations are disabled, clear any existing glow animations.
       */
      watch(animationsEnabled, (newVal) => {
        console.log(`Animations Enabled: ${newVal}`);
        if (!newVal) {
          clearGlowEffects(); // Clear existing glow animations when disabling animations
        }
        // Additional logic can be added here if needed
      });
  
      /**
       * Setup GSAP animations for the control panel.
       */
      onMounted(() => {
        if (controlPanel.value) {
          gsap.fromTo(
            controlPanel.value,
            { x: '100%' },
            { x: '0%', duration: 0.5, ease: 'power2.out' }
          );
        }
      });
  
      /**
       * Animate sliding out when the control panel is about to unmount.
       */
      onBeforeUnmount(() => {
        if (controlPanel.value) {
          gsap.to(controlPanel.value, {
            x: '100%',
            duration: 0.5,
            ease: 'power2.in',
          });
        }
      });
  
      return {
        controlPanel,
        closePanel,
        animationsEnabled,
      };
    },
  });
  </script>
  
  <style scoped>
  .control-panel {
    /* Ensure the control panel is hidden initially for accessibility */
    transform: translateX(100%);
    transition: transform 0.5s ease;
  }
  
  .toggle-checkbox {
    width: 40px;
    height: 20px;
    appearance: none;
    background-color: #374151;
    border-radius: 9999px;
    position: relative;
    outline: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .toggle-checkbox:checked {
    background-color: #3b82f6;
  }
  
  .toggle-checkbox::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    background-color: white;
    border-radius: 50%;
    top: 1px;
    left: 1px;
    transition: transform 0.3s ease;
  }
  
  .toggle-checkbox:checked::after {
    transform: translateX(20px);
  }
  </style> 
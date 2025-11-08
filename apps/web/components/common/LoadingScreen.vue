<script setup lang="ts">
import { ref, onMounted } from 'vue';

const dots = ref(0);
const dotsText = ref('');

// Animation for loading dots
onMounted(() => {
  const interval = setInterval(() => {
    dots.value = (dots.value + 1) % 4;
    dotsText.value = '.'.repeat(dots.value);
  }, 300);

  return () => clearInterval(interval);
});
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-dark-300 z-50">
    <div class="text-center">
      <div class="mb-4">
        <div class="inline-block w-12 h-12 relative">
          <div class="absolute inset-0 border-4 border-t-primary-400 border-r-primary-300 border-b-primary-200 border-l-primary-100 rounded-full animate-spin"></div>
        </div>
      </div>
      <h2 class="text-xl font-display font-bold text-white mb-1">
        <span class="text-primary-400">Player2</span> Esports
      </h2>
      <p class="text-gray-400">
        Loading{{ dotsText }}
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
<script setup lang="ts">
definePageMeta({ layout: 'saas-app' });
if (import.meta.server) {
  await navigateTo('/app/team');
} else {
  navigateTo('/app/team', { replace: true });
}
</script>

<template>
  <div />
</template>
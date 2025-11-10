<script setup lang="ts">
if (import.meta.server) {
  await navigateTo('/app/team');
} else {
  navigateTo('/app/team', { replace: true });
}
</script>

<template>
  <div />
</template>



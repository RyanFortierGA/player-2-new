<script setup lang="ts">
  const runtimeConfig = useRuntimeConfig();
  await navigateTo(runtimeConfig.public.auth.redirectPath);
</script>

<template>
  <div />
</template>

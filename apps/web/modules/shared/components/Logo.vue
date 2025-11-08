<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      withLabel?: boolean;
    }>(),
    {
      withLabel: true,
    },
  );
</script>

<template>
  <span class="flex items-center font-semibold leading-none text-primary">
    <svg class="size-10" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2" />
      <text x="16" y="21" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor" style="font-family: Geist, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';">2</text>
    </svg>
    <span
      v-if="props.withLabel"
      class="ml-3 hidden whitespace-nowrap text-lg text-foreground md:block"
      >Player 2</span
    >
  </span>
</template>

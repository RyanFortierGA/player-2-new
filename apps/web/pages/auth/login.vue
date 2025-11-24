<script setup lang="ts">
  const { t } = useTranslations();
  definePageMeta({ layout: "saas-auth" });
  useSeoMeta({ title: t("auth.login.title") });
</script>

<template>
  <ClientOnly fallback="<div class='text-center text-muted-foreground'>Loading…</div>">
    <SaasLoginForm />
  </ClientOnly>
</template>

<script setup lang="ts">
  const { t } = useTranslations();

  definePageMeta({
    layout: "saas-auth",
  });

  useSeoMeta({
    title: t("auth.login.title"),
  });
</script>

<template>
  <div>
    <SaasLoginForm />
    <p class="mt-4 text-center text-xs text-muted-foreground">
      Build: 2025-11-20 12:06Z
    </p>
  </div>
</template>

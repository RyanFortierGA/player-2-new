<script setup lang="ts">
  definePageMeta({
    layout: "saas-app",
  });

  const { t } = useTranslations();
  const { user } = useUser();

  useSeoMeta({
    title: t("settings.account.title"),
  });

  watchEffect(() => {
    if (!user.value) {
      navigateTo("/auth/login");
    }
  });
</script>

<template>
  <div v-if="user" class="grid gap-6">
    <SaasUserAvatarForm />
    <SaasChangeNameForm :initialValue="user.name || ''" />
    <SaasChangePasswordForm />
    <SaasDeleteAccountForm />
  </div>
</template>

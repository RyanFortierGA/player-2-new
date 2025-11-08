<script setup lang="ts">
  definePageMeta({
    layout: "saas-auth",
  });

  const { apiCaller } = useApiCaller();

  const { data: user } = await apiCaller.auth.user.useQuery();

  if (!user.value) {
    await navigateTo("/auth/login");
  }

  if (user.value!.onboardingComplete) {
    await navigateTo("/app/dashboard");
  }
</script>

<template>
  <SaasOnboardingForm />
</template>

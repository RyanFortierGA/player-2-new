<script setup lang="ts">
  definePageMeta({
    layout: "saas-app",
  });

  const { t } = useTranslations();
  const { currentTeam } = useUser();

  useSeoMeta({
    title: t("settings.team.title"),
  });

  const { error, pending } = useAsyncData(async () => ({ ok: true }));

  watchEffect(() => {
    if (!pending.value && (!currentTeam.value || error.value)) {
      navigateTo("/auth/login");
    }
  });
</script>

<template>
  <div v-if="!pending && currentTeam" class="grid grid-cols-1 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Team members are managed from your Team page</CardTitle>
        <CardDescription>Edit roster, add/remove players, and view schedule on the Team page.</CardDescription>
      </CardHeader>
      <CardFooter>
        <NuxtLink to="/app/team">
          <Button>Go to Team</Button>
        </NuxtLink>
      </CardFooter>
    </Card>
  </div>
  <SaasLoadingSpinner v-else />
</template>

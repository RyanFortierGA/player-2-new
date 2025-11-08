<script setup lang="ts">
  const { user, reloadUser } = useUser();
  const currentTeamId = useCurrentTeamIdCookie();

  onMounted(async () => {
    if (!user.value) {
      await reloadUser();
    }

    if (!user.value) {
      await navigateTo("/auth/login");
      return;
    }

    if (!user.value.onboardingComplete) {
      await navigateTo("/onboarding");
      return;
    }

    const teamMemberships = user.value.teamMemberships ?? [];
    const currentTeamMembership =
      teamMemberships.find((m) => m.team.id === currentTeamId.value) ??
      teamMemberships[0];

    if (!currentTeamMembership) {
      await navigateTo("/");
      return;
    }

    currentTeamId.value = currentTeamMembership.team.id;
  });
</script>

<template>
  <SaasNavBar />

  <main class="min-h-screen overflow-y-auto bg-background text-foreground">
    <slot />
  </main>

  <SaasFooter />
</template>

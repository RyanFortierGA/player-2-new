<script setup lang="ts">
  const { t } = useTranslations();
  const { user } = useUser();
  const { apiCaller } = useApiCaller();
  const currentTeamId = useCurrentTeamIdCookie();

  const { data: team } = await useAsyncData('dashboard-team', async () => {
    if (!currentTeamId.value) return null;
    try { return await apiCaller.team.byId.query({ id: currentTeamId.value }); } catch { return null; }
  }, { watch: [currentTeamId] });

  definePageMeta({
    layout: "saas-app",
  });
</script>

<template>
  <div class="container max-w-6xl py-8">
    <SaasPageHeader>
      <template #title>{{
        t("dashboard.welcome", { name: user?.name })
      }}</template>
      <template #subtitle>{{ $t("dashboard.subtitle") }}</template>
    </SaasPageHeader>

    <div class="mt-8 grid gap-4 md:grid-cols-3">
      <SaasStatsTile
        title="New clients"
        :value="344"
        valueFormat="number"
        :trend="0.12"
      />
      <SaasStatsTile
        title="Revenue"
        :value="5243"
        valueFormat="currency"
        :trend="0.6"
      />
      <SaasStatsTile
        title="Churn"
        :value="0.03"
        valueFormat="percentage"
        :trend="-0.3"
      />
    </div>

    <Card class="mt-8 p-6" v-if="team">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500">Team status</div>
          <div class="text-xl font-semibold uppercase">{{ team?.status || 'UNASSIGNED' }}</div>
        </div>
        <div class="flex gap-3">
          <NuxtLink v-if="team?.status==='ASSIGNED'" to="/app/settings/team/billing">
            <Button>Activate subscription</Button>
          </NuxtLink>
          <NuxtLink v-else-if="team?.status==='UNASSIGNED' || team?.status==='WAITLIST'" to="/app/team">
            <Button variant="outline">Manage roster</Button>
          </NuxtLink>
        </div>
      </div>
    </Card>
  </div>
</template>

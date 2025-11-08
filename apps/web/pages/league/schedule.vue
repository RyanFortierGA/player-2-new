<script setup lang="ts">
definePageMeta({ layout: 'saas-app' });
const route = useRoute();
const router = useRouter();

const region = ref<string>((route.query.region as string) || 'US_EAST');
// Keep as strings so Select shows defaults
const levelStr = ref<string>(String(route.query.level || '1'));
const weekStr = ref<string>(String(route.query.week || '1'));
const teamSizeStr = ref<string>(String(route.query.teamSize || '4'));

watch([region, levelStr, weekStr, teamSizeStr], () => {
  router.replace({ query: { region: region.value, level: String(levelStr.value), week: String(weekStr.value), teamSize: String(teamSizeStr.value) } });
  refresh();
});

const { data, pending, error, refresh } = useAsyncData('schedule', async () => {
  const params = new URLSearchParams({ region: region.value, level: String(levelStr.value), teamSize: String(teamSizeStr.value) });
  if (weekStr.value) params.set('week', String(weekStr.value));
  return await $fetch(`/api/league/schedule?${params.toString()}`);
});
</script>

<template>
  <div>
    <section class="bg-gradient-to-b from-background to-transparent pb-4 pt-24">
      <div class="container mx-auto px-6">
        <h1 class="text-3xl font-bold tracking-tight">Schedule</h1>
        <p class="text-muted-foreground mt-2">Filter by region, division and week.</p>
      </div>
    </section>
    <div class="container mx-auto px-6 pb-12">
      <div class="flex flex-wrap items-end gap-4 mb-4 text-foreground">
        <div>
          <label class="block text-xs text-muted-foreground mb-1">Region</label>
          <Select v-model="region">
            <SelectTrigger class="w-56 bg-background text-foreground"><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent class="bg-background text-foreground border border-border">
              <SelectItem value="US_EAST">US East</SelectItem>
              <SelectItem value="US_WEST">US West</SelectItem>
              <SelectItem value="EUROPE">Europe</SelectItem>
              <SelectItem value="ASIA">Asia</SelectItem>
              <SelectItem value="AU_NZ">Australia / New Zealand</SelectItem>
              <SelectItem value="SOUTH_AMERICA">South America</SelectItem>
              <SelectItem value="AFRICA">Africa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="block text-xs text-muted-foreground mb-1">Division</label>
          <Select v-model="levelStr">
            <SelectTrigger class="w-32 bg-background text-foreground"><SelectValue placeholder="Division" /></SelectTrigger>
            <SelectContent class="bg-background text-foreground border border-border">
              <SelectItem v-for="n in 6" :key="n" :value="String(n)">Div {{ n }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="block text-xs text-muted-foreground mb-1">Format</label>
          <Select v-model="teamSizeStr">
            <SelectTrigger class="w-32 bg-background text-foreground"><SelectValue placeholder="Format" /></SelectTrigger>
            <SelectContent class="bg-background text-foreground border border-border">
              <SelectItem value="4">4v4</SelectItem>
              <SelectItem value="2">2v2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="block text-xs text-muted-foreground mb-1">Week</label>
          <Select v-model="weekStr">
            <SelectTrigger class="w-24 bg-background text-foreground"><SelectValue placeholder="Week" /></SelectTrigger>
            <SelectContent class="bg-background text-foreground border border-border">
              <SelectItem v-for="n in 8" :key="n" :value="String(n)">Week {{ n }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table v-if="!pending && !error">
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Home</TableHead>
            <TableHead>Away</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="m in (data as any[] || [])" :key="m.id" class="odd:bg-background even:bg-muted/50">
            <TableCell>{{ m.weekNumber }}</TableCell>
            <TableCell>{{ new Date(m.scheduledAt).toLocaleString() }}</TableCell>
            <TableCell>
              <NuxtLink class="hover:underline" :to="`/teams/${m.homeTeam?.id}`">{{ m.homeTeam?.name }}</NuxtLink>
            </TableCell>
            <TableCell>
              <NuxtLink class="hover:underline" :to="`/teams/${m.awayTeam?.id}`">{{ m.awayTeam?.name }}</NuxtLink>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{{ m.status }}</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Alert v-if="pending">Loading...</Alert>
      <Alert v-else-if="error" variant="destructive">Failed to load schedule</Alert>
    </div>
  </div>
</template>
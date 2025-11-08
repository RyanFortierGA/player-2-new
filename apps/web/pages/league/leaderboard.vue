<script setup lang="ts">
definePageMeta({ layout: 'saas-app' });
const route = useRoute();
const router = useRouter();

const region = ref<string>((route.query.region as string) || 'US_EAST');
// Keep Select values as strings so the UI shows a selected value by default
const levelStr = ref<string>(String(route.query.level || '1'));
const teamSizeStr = ref<string>(String(route.query.teamSize || '4'));

watch([region, levelStr, teamSizeStr], () => {
  router.replace({ query: { region: region.value, level: String(levelStr.value), teamSize: String(teamSizeStr.value) } });
  refresh();
});

const { data, pending, error, refresh } = useAsyncData('leaderboard', async () => {
  const params = new URLSearchParams({ region: region.value, level: String(levelStr.value), teamSize: String(teamSizeStr.value) });
  return await $fetch(`/api/league/standings?${params.toString()}`);
});
</script>

<template>
  <div>
    <section class="bg-gradient-to-b from-background to-transparent pb-4 pt-24">
      <div class="container mx-auto px-6">
        <h1 class="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p class="text-muted-foreground mt-2">See rankings by region and division.</p>
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
      </div>

      <Table v-if="!pending && !error">
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead class="text-right">Pts</TableHead>
            <TableHead class="text-right">W</TableHead>
            <TableHead class="text-right">L</TableHead>
            <TableHead class="text-right">T</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="t in (data as any[] || [])" :key="t.id" class="odd:bg-background even:bg-muted/50">
            <TableCell>
              <NuxtLink class="hover:underline" :to="`/teams/${t.id}`">{{ t.name }}</NuxtLink>
            </TableCell>
            <TableCell class="text-right">{{ t.points }}</TableCell>
            <TableCell class="text-right">{{ t.wins }}</TableCell>
            <TableCell class="text-right">{{ t.losses }}</TableCell>
            <TableCell class="text-right">{{ t.ties }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Alert v-if="pending">Loading...</Alert>
      <Alert v-else-if="error" variant="destructive">Failed to load standings</Alert>
    </div>
  </div>
  
</template>
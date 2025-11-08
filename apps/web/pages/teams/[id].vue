<script setup lang="ts">
definePageMeta({ layout: 'marketing' });
const route = useRoute();
const id = route.params.id as string;
const { data, pending, error } = useAsyncData('public-team', async () => {
  return await $fetch('/api/public/team', { params: { id } });
});
</script>

<template>
  <div>
    <section class="bg-gradient-to-b from-background to-transparent pb-4 pt-24">
      <div class="container mx-auto px-6">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ data?.name || 'Team' }}</h1>
        <p class="text-muted-foreground mt-2">
          {{ data?.division ? `Div ${data?.division?.level} · ${data?.division?.region}` : (data?.region || 'Unassigned') }}
        </p>
      </div>
    </section>
    <div class="container mx-auto px-6 pb-12">
      <div v-if="pending">Loading...</div>
      <div v-else-if="error">Not found</div>
      <div v-else>
        <h2 class="text-xl font-semibold mb-3">Roster</h2>
        <table class="min-w-full border text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-2 border text-left">Name</th>
              <th class="p-2 border text-left">Gamer Tag</th>
              <th class="p-2 border text-left">Platform</th>
              <th class="p-2 border text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in data?.players || []" :key="p.id" class="odd:bg-white even:bg-gray-50">
              <td class="p-2 border">{{ p.name }}</td>
              <td class="p-2 border">{{ p.gamerTag || '-' }}</td>
              <td class="p-2 border">{{ p.platform || '-' }}</td>
              <td class="p-2 border">{{ p.role || 'Player' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>



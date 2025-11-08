<script setup lang="ts">
definePageMeta({ layout: 'saas-app', ssr: false });
const { apiCaller } = useApiCaller();
const { user } = useUser();

const currentTeamId = useCurrentTeamIdCookie();

watchEffect(() => {
  if (!currentTeamId.value && user.value?.teamMemberships?.length) {
    currentTeamId.value = user.value.teamMemberships[0].team.id;
  }
});

const teamId = computed(() => currentTeamId.value || null);

const { data: team, pending: teamPending } = useAsyncData<any>('team-byid', async () => {
  if (!teamId.value) return null;
  try {
    return await apiCaller.team.byId.query({ id: teamId.value as string });
  } catch { return null; }
}, { watch: [teamId], lazy: true });

// Fetch players via internal API to avoid hydration/type issues
const { data: players, pending: playersPending } = useAsyncData<any[]>('team-players', async () => {
  if (!teamId.value) return [] as any[];
  return await ( $fetch as any )('/api/team/players', { params: { teamId: teamId.value as string } }) as any[];
}, { watch: [teamId], lazy: true });
const { data: schedule, pending: schedulePending } = useAsyncData<any[]>('team-schedule', async () => {
  if (!teamId.value) return [] as any[];
  return await ( $fetch as any )('/api/team/schedule', { params: { teamId: teamId.value as string } }) as any[];
}, { watch: [teamId], lazy: true });

// Newest unreported match (no scores yet)
const { data: unreported, pending: unreportedPending } = useAsyncData<any | null>('team-unreported', async () => {
  if (!teamId.value) return null as any;
  return await ( $fetch as any )('/api/match/unreported', { params: { teamId: teamId.value as string } }) as any;
}, { watch: [teamId], lazy: true });

const outcome = ref<'WIN'|'LOSS'>('WIN');
const scoreChoice = ref('3-0');
const submitting = ref(false);
const submitNotes = ref('');

const mySideLabel = computed(() => {
  if (!unreported.value || !teamId.value) return '';
  return unreported.value.homeTeam?.id === teamId.value ? 'Home' : 'Away';
});

function parseScorePair(choice: string): [number, number] {
  const [a, b] = choice.split('-').map((n) => Number(n));
  return [a, b];
}

const availableScores = computed(() => outcome.value === 'WIN' ? ['3-0','3-1','3-2'] : ['0-3','1-3','2-3']);

async function submitResult() {
  if (!unreported.value || !teamId.value) return;
  submitting.value = true;
  try {
    // Ensure score choice matches outcome
    if (outcome.value === 'WIN' && !scoreChoice.value.startsWith('3-')) scoreChoice.value = '3-0';
    if (outcome.value === 'LOSS' && !scoreChoice.value.endsWith('-3')) scoreChoice.value = '0-3';
    const [x, y] = parseScorePair(scoreChoice.value);
    const isHome = unreported.value.homeTeam?.id === teamId.value;
    const myScore = x;
    const theirScore = y;
    const res = await $fetch('/api/match/report', {
      method: 'POST',
      body: { matchId: unreported.value.id, teamId: teamId.value as string, myScore, theirScore, notes: submitNotes.value || undefined },
    });
    await Promise.all([
      refreshNuxtData('team-schedule'),
      refreshNuxtData('team-unreported'),
    ]);
  } catch (e) {
    // noop – UI keeps selection for retry
  } finally {
    submitting.value = false;
  }
}

function parseUnreportedNotes(): any {
  try {
    return unreported.value?.notes ? JSON.parse(unreported.value.notes) : {};
  } catch { return {}; }
}
const isHomeTeam = computed(() => !!unreported.value && !!teamId.value && unreported.value.homeTeam?.id === teamId.value);
const mySubmission = computed(() => {
  const n = parseUnreportedNotes();
  return isHomeTeam.value ? n.homeSubmit : n.awaySubmit;
});
const oppSubmission = computed(() => {
  const n = parseUnreportedNotes();
  return isHomeTeam.value ? n.awaySubmit : n.homeSubmit;
});
const awaitingOpponent = computed(() => !!mySubmission.value && !oppSubmission.value && unreported.value?.status !== 'NEEDS_RESOLUTION');
const awaitingYou = computed(() => !mySubmission.value && !!oppSubmission.value && unreported.value?.status !== 'NEEDS_RESOLUTION');
const bothSubmitted = computed(() => !!mySubmission.value && !!oppSubmission.value);

const record = computed(() => {
  let w = 0, l = 0, t = 0;
  for (const m of (schedule.value || [])) {
    if (m.status !== 'COMPLETED') continue;
    if (m.homeTeam?.id === teamId.value) {
      if ((m.homeScore ?? 0) > (m.awayScore ?? 0)) w++; else if ((m.homeScore ?? 0) < (m.awayScore ?? 0)) l++; else t++;
    } else if (m.awayTeam?.id === teamId.value) {
      if ((m.awayScore ?? 0) > (m.homeScore ?? 0)) w++; else if ((m.awayScore ?? 0) < (m.homeScore ?? 0)) l++; else t++;
    }
  }
  return { w, l, t };
});
const addPlayerMutation = apiCaller.team.addPlayer.useMutation();
const updatePlayerMutation = apiCaller.team.updatePlayer.useMutation();
const removePlayerMutation = apiCaller.team.removePlayer.useMutation();
const newName = ref('');
const newGamerTag = ref('');
const newPlatform = ref('');
const newRole = ref('');
const newIsSub = ref(false);

async function save(player: any) {
  await updatePlayerMutation.mutate({
    id: player.id,
    name: player.name,
    gamerTag: player.gamerTag || null,
    platform: player.platform || null,
    role: player.role || null,
    isSub: !!player.isSub,
  });
  await refreshNuxtData('team-players');
}

async function addPlayer() {
  if (!teamId.value || !newName.value) return;
  await addPlayerMutation.mutate({ teamId: teamId.value, name: newName.value, gamerTag: newGamerTag.value || undefined, platform: newPlatform.value || undefined, role: newRole.value || undefined, isSub: newIsSub.value });
  newName.value = '';
  newGamerTag.value = '';
  newPlatform.value = '';
  newRole.value = '';
  newIsSub.value = false;
  await refreshNuxtData('team-players');
}

async function removePlayer(id: string) {
  await removePlayerMutation.mutate({ id });
  await refreshNuxtData('team-players');
}
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-1 text-foreground">{{ team?.name || 'Team' }}</h1>
    <p class="text-sm text-muted-foreground mb-4" v-if="team?.region">{{ team.region }} <span v-if="team?.division">· Div {{ team.division.level }}</span></p>
    <div v-if="!teamId">You are not on a team yet.</div>
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <div>
          <label class="block text-sm text-gray-500 mb-1">Name</label>
          <Input v-model="newName" placeholder="Player name" />
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">Gamer Tag</label>
          <Input v-model="newGamerTag" placeholder="Gamer tag" />
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">Platform</label>
          <Select v-model="newPlatform">
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PS">PlayStation</SelectItem>
              <SelectItem value="XB">Xbox</SelectItem>
              <SelectItem value="PC">PC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">Role</label>
          <Input v-model="newRole" placeholder="Role (e.g., Captain)" />
        </div>
        <div class="flex items-end gap-3">
          <label class="flex items-center gap-2 text-sm text-gray-500"><input type="checkbox" v-model="newIsSub" /> Sub</label>
          <Button @click="addPlayer" :disabled="!newName">Add player</Button>
        </div>
      </div>
      <div class="mb-4 text-sm text-muted-foreground">Record: {{ record.w }}-{{ record.l }}-{{ record.t }}</div>

      <div v-if="unreported" class="mb-6 rounded-md border bg-background">
        <div class="p-4 border-b flex items-center justify-between">
          <div class="text-sm text-muted-foreground">Newest unreported match</div>
          <div class="text-xs px-2 py-1 rounded bg-muted text-foreground">{{ mySideLabel }}</div>
        </div>
        <div class="p-4 flex flex-col gap-3">
          <div class="text-foreground text-sm">
            Week {{ unreported.weekNumber }} · {{ new Date(unreported.scheduledAt).toLocaleString() }}
            <span v-if="unreported?.division?.teamSize" class="text-muted-foreground"> · {{ unreported.division.teamSize }}v{{ unreported.division.teamSize }}</span>
          </div>
          <div class="text-foreground font-medium">
            {{ unreported.homeTeam?.name }} vs {{ unreported.awayTeam?.name }}
          </div>
          <div v-if="unreported?.status === 'NEEDS_RESOLUTION'" class="text-xs text-yellow-600 dark:text-yellow-400">
            Winner conflict — Needs Resolution. Admins will review.
          </div>
          <div v-else-if="awaitingOpponent" class="text-xs text-muted-foreground">
            Your submission: {{ mySubmission.scoreFor }}-{{ mySubmission.scoreAgainst }} · Waiting for opponent to confirm.
          </div>
          <div v-else-if="awaitingYou" class="text-xs text-muted-foreground">
            Opponent submitted: {{ oppSubmission.scoreFor }}-{{ oppSubmission.scoreAgainst }} · Please submit your result.
          </div>
          <div class="flex flex-wrap items-end gap-4">
            <div>
              <label class="block text-xs text-muted-foreground mb-1">Outcome</label>
              <Select v-model="outcome" :disabled="awaitingOpponent">
                <SelectTrigger class="w-32"><SelectValue placeholder="Outcome" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WIN">Win</SelectItem>
                  <SelectItem value="LOSS">Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label class="block text-xs text-muted-foreground mb-1">Score</label>
              <Select v-model="scoreChoice" :disabled="awaitingOpponent">
                <SelectTrigger class="w-32"><SelectValue placeholder="Score" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in availableScores" :key="s" :value="s">{{ s }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="pb-1">
              <Button :disabled="submitting || awaitingOpponent" @click="submitResult">Submit result</Button>
            </div>
          </div>
          <div>
            <label class="block text-xs text-muted-foreground mb-1">Notes (optional)</label>
            <Textarea
              v-model="submitNotes"
              placeholder="Explain anything unusual (disconnects, FF, etc.)"
              class="border border-border rounded-md p-3 text-sm placeholder:text-xs placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div class="text-xs text-muted-foreground">Both teams must submit the same score to confirm.</div>
        </div>
      </div>
      <table class="min-w-full border text-sm">
        <thead class="bg-muted">
          <tr>
            <th class="p-2 border text-left">Player</th>
            <th class="p-2 border text-left">Gamer Tag</th>
            <th class="p-2 border text-left">Platform</th>
            <th class="p-2 border text-left">Sub</th>
            <th class="p-2 border text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in (players || [])" :key="m.id" class="odd:bg-background even:bg-muted/50">
            <td class="p-2 border"><input v-model="m.name" class="border rounded px-2 py-1 w-full" placeholder="Name" /></td>
            <td class="p-2 border"><input v-model="m.gamerTag" class="border rounded px-2 py-1 w-full" placeholder="Gamer Tag" /></td>
            <td class="p-2 border">
              <select v-model="m.platform" class="border rounded px-2 py-1 w-full">
                <option :value="null">Select</option>
                <option value="PS">PlayStation</option>
                <option value="XB">Xbox</option>
                <option value="PC">PC</option>
              </select>
            </td>
            <td class="p-2 border"><input type="checkbox" v-model="m.isSub" />
            </td>
            <td class="p-2 border flex gap-2">
              <button class="px-3 py-1 border rounded" @click="save(m)">Save</button>
              <button class="px-3 py-1 border rounded" @click="removePlayer(m.id)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>
      <h2 class="text-xl font-semibold mt-8 mb-3">Schedule</h2>
      <Table>
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
          <TableRow v-for="m in (schedule || [])" :key="m.id">
            <TableCell>{{ m.weekNumber }}</TableCell>
            <TableCell>{{ new Date(m.scheduledAt).toLocaleString() }}</TableCell>
            <TableCell>{{ m.homeTeam?.name }}</TableCell>
            <TableCell>{{ m.awayTeam?.name }}</TableCell>
            <TableCell>{{ m.status }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>



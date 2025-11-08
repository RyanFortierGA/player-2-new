<script setup lang="ts">
definePageMeta({ layout: 'saas-app' });
const { user, loaded: userLoaded } = useUser();
</script>

<template>
  <section class="bg-background text-foreground">
    <div class="container mx-auto px-6 pt-28 pb-12">
      <h1 class="text-3xl font-bold tracking-tight">Rules & How it Works</h1>
      <p class="mt-2 text-muted-foreground">Short version of league structure and match rules. Full rulebook coming soon.</p>
    </div>
  </section>

  <section>
    <div class="container mx-auto px-6 pb-12">
      <h2 class="text-xl font-semibold">Formats & Divisions</h2>
      <ul class="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>2v2 (max roster 3) and 4v4 (max roster 6)</li>
        <li>Regional divisions: US East, US West, Europe, Asia, Australia/NZ, South America, Africa</li>
        <li>8‑week regular season, 1 match per week (Tuesdays)</li>
        <li>Promotion & relegation at season end</li>
      </ul>

      <h2 class="mt-8 text-xl font-semibold">Match Flow (Best of 5)</h2>
      <ul class="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Mapset: Hardpoint → S&D → Overload → Hardpoint → S&D</li>
        <li>Map/MM mode picks simplified: away bans one map/mode, host bans one → picks alternate (Away: HP1, Host: SND2, Away: OVR3, Host: HP4, Away: SND5)</li>
        <li>Admins can spectate; lobbies are invite-only</li>
      </ul>

      <h2 class="mt-8 text-xl font-semibold">Disconnect Rules</h2>
      <ul class="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>S&D / Overload: finish the current round, pause, resume next round on player return</li>
        <li>Hardpoint: play out 3v4 unless player returns or both teams agree to replay</li>
      </ul>

      <h2 class="mt-8 text-xl font-semibold">Late Penalties</h2>
      <ul class="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Map 1: 15‑minute grace; after that, FF map 1</li>
        <li>Map 2: additional 5 minutes; 20 minutes total → FF map 2</li>
        <li>Map 3+: additional 5 minutes; 25 minutes total → FF match</li>
      </ul>

      <h2 class="mt-8 text-xl font-semibold">Points & Tie‑breakers</h2>
      <ul class="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Win = 3 points, Loss = 0 points</li>
        <li>Tie‑breaker: map differential (wins − losses)</li>
      </ul>

      <h2 class="mt-8 text-xl font-semibold">Tournament Points</h2>
      <ul class="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>1st: 21 pts • 2nd: 15 pts • 3rd: 9 pts • 4th: 3 pts</li>
      </ul>

      <h2 class="mt-8 text-xl font-semibold">Appeals</h2>
      <p class="mt-3 text-muted-foreground">Open a ticket in our Discord with match details (teams, map, timestamp, issue). League admins will review and respond.</p>

      <h2 class="mt-8 text-xl font-semibold">Submitting Match Results</h2>
      <ol class="mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">
        <li>Go to <strong>App → Team</strong>.</li>
        <li>At the top, you’ll see your newest unreported match.</li>
        <li>Select <strong>Win</strong> or <strong>Loss</strong> and choose the map score (e.g., 3-1). Add optional notes if needed.</li>
        <li>Submit your result. The other team must also submit their result.</li>
        <li>When both teams agree on the winner, the result is auto-confirmed and standings update (minor map-count differences are okay).</li>
        <li>If teams disagree on the winner, the match status becomes <strong>Needs Resolution</strong> and is reviewed via Discord ticket.</li>
      </ol>

      <div class="mt-10">
        <NuxtLink v-if="user" to="/app/team"><Button size="lg">Go to your team</Button></NuxtLink>
        <NuxtLink v-else to="/auth/signup"><Button size="lg">Create your team</Button></NuxtLink>
      </div>
    </div>
  </section>
</template>



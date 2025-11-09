<script setup lang="ts">
  definePageMeta({
    layout: "marketing",
  });
  
</script>

<template>
  <!-- Hero -->
  <section class="relative overflow-hidden bg-background">
    <!-- Animated background -->
    <div class="pointer-events-none absolute inset-0">
      <!-- Subtle grid -->
      <div class="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]" style="background-image:linear-gradient(to right, var(--grid-color) 1px, transparent 1px),linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px); background-size:24px 24px; --grid-color: hsl(var(--foreground)/0.3);"></div>
      <!-- Moving gradient blobs -->
      <div class="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/40 blur-[110px] animate-float"></div>
      <div class="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-500/40 blur-[140px] animate-float-delayed"></div>
    </div>
    <div class="container mx-auto px-6 pt-28 pb-16 relative">
      <div class="grid gap-8 lg:grid-cols-1 lg:items-center">
        <div class="relative z-10 text-center max-w-3xl mx-auto">
          <h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Player Two League
          </h1>
          <p class="mt-4 max-w-prose text-muted-foreground">
            2v2 and 4v4 Black Ops 7 league. Weekly matches, regional divisions,
            end‑of‑season tournament, and automated scheduling. Build your roster
            and climb the ladder.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <NuxtLink to="/auth/signup">
              <Button size="lg">Sign up free</Button>
            </NuxtLink>
            <NuxtLink to="/league/leaderboard">
              <Button variant="outline" size="lg">View leaderboard</Button>
            </NuxtLink>
          </div>
          <div class="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div class="flex items-center gap-2"><Badge>2v2</Badge> <span>Max roster 3</span></div>
            <div class="flex items-center gap-2"><Badge>4v4</Badge> <span>Max roster 6</span></div>
            <div class="flex items-center gap-2"><Badge>Regions</Badge> <span>US/EU/ASIA/AU‑NZ/SA/AFR</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Highlights (two-column, not cards) -->
  <section class="bg-muted/20">
    <div class="container mx-auto px-6 py-12">
      <div class="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">Why join</h2>
          <ul class="mt-4 space-y-3 text-muted-foreground">
            <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-primary"></span> Clean onboarding: create a team, choose 2v2/4v4 & region.</li>
            <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-primary"></span> Automated weekly schedule, smart matchups, clear rules.</li>
            <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-primary"></span> Live leaderboard, standings, and end‑season tournament.</li>
          </ul>
        </div>
        <div>
          <h2 class="text-2xl font-semibold text-foreground">Format</h2>
          <ul class="mt-4 space-y-3 text-muted-foreground">
            <li>1 match per week · 8 weeks · points table</li>
            <li>Promotion/relegation between divisions each season</li>
            <li>Mapset: HP / SND / Overload / HP / SND (best of 5)</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Built for all skill levels / life-friendly scheduling -->
  <section>
    <div class="container mx-auto px-6 py-16">
      <div class="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 class="text-2xl font-semibold text-foreground">For every skill level</h2>
          <p class="mt-3 max-w-prose text-muted-foreground">
            Player Two is for anyone who loves competing — from newcomers to seasoned players.
            It’s designed for people with day jobs who still want the experience of an organized league:
            structured divisions, clear rules, standings, and end‑season tournament.
          </p>
        </div>
        <div>
          <h3 class="text-lg font-medium text-foreground">Life‑friendly schedule</h3>
          <ul class="mt-3 space-y-2 text-muted-foreground">
            <li class="flex items-start gap-2"><span class="mt-1 h-2 w-2 rounded-full bg-primary"></span> One match per week (Tuesday evenings)</li>
            <li class="flex items-start gap-2"><span class="mt-1 h-2 w-2 rounded-full bg-primary"></span> Regional divisions to reduce latency</li>
            <li class="flex items-start gap-2"><span class="mt-1 h-2 w-2 rounded-full bg-primary"></span> Simple roster management with subs</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- How it works -->
  <section>
    <div class="container mx-auto px-6 py-16">
      <h2 class="text-2xl font-semibold text-foreground">Get started in minutes</h2>
      <ol class="mt-6 grid gap-6 md:grid-cols-3 text-muted-foreground">
        <li class="rounded-lg border border-border bg-background p-5">
          <div class="text-sm uppercase tracking-wide text-primary">Step 1</div>
          <div class="mt-2 font-medium text-foreground">Create your account</div>
          <div class="mt-1 text-sm">Sign up and verify. It’s free to get started.</div>
        </li>
        <li class="rounded-lg border border-border bg-background p-5">
          <div class="text-sm uppercase tracking-wide text-primary">Step 2</div>
          <div class="mt-2 font-medium text-foreground">Form your team</div>
          <div class="mt-1 text-sm">Pick 2v2 or 4v4, set region, add player handles.</div>
        </li>
        <li class="rounded-lg border border-border bg-background p-5">
          <div class="text-sm uppercase tracking-wide text-primary">Step 3</div>
          <div class="mt-2 font-medium text-foreground">Join the ladder</div>
          <div class="mt-1 text-sm">Get assigned, activate your season, and play.</div>
        </li>
      </ol>
      <div class="mt-8">
        <NuxtLink to="/auth/signup"><Button size="lg">Create your team</Button></NuxtLink>
      </div>
    </div>
  </section>

  <!-- Social proof placeholder -->
  <section class="bg-muted/20">
    <div class="container mx-auto px-6 py-12">
      <!-- <p class="text-center text-muted-foreground">Trusted by players across US/EU/ASIA. More regions coming soon.</p> -->
    </div>
  </section>
</template>

<style scoped>
@keyframes float {
  0% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-12px) translateX(8px); }
  100% { transform: translateY(0) translateX(0); }
}
.animate-float { animation: float 10s ease-in-out infinite; }
.animate-float-delayed { animation: float 12s ease-in-out infinite; animation-delay: .7s; }
</style>

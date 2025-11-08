<template>
  <footer class="bg-muted py-12 text-muted-foreground">
    <div class="container grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div>
        <Logo class="opacity-50 grayscale" />
        <p class="mt-3 text-sm opacity-70">
          <a href="https://supastarter.dev">Built with supastarter</a>
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <NuxtLink to="/league/leaderboard" class="block"> Leaderboard </NuxtLink>
        <NuxtLink to="/league/schedule" class="block"> Schedule </NuxtLink>
        <NuxtLink to="/rules" class="block"> Rules / How it works </NuxtLink>
      </div>

      <div class="flex flex-col gap-2">
        <NuxtLink to="/legal/privacy" class="block"> Privacy policy </NuxtLink>
        <NuxtLink to="/legal/terms" class="block"> Terms and conditions </NuxtLink>
      </div>
    </div>
  </footer>
</template>

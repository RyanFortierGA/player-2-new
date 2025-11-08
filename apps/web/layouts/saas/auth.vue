<template>
  <div class="flex min-h-screen w-full p-8">
    <div class="flex w-full flex-col items-center justify-between gap-8">
      <div class="container">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="block">
            <Logo />
          </NuxtLink>

          <div class="flex items-center justify-end gap-2">
            <LocaleSwitch v-if="false" />
            <ColorModeToggle v-if="false" />
          </div>
        </div>
      </div>

      <main class="w-full max-w-md">
        <slot />
      </main>

      <SaasFooter />
    </div>
  </div>
</template>

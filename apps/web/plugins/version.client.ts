export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const currentBuildId = (config.public as any).buildId as string | undefined;
  if (!currentBuildId) return;

  const STORAGE_KEY = "APP_BUILD_ID";
  const previousBuildId = localStorage.getItem(STORAGE_KEY);

  if (previousBuildId && previousBuildId !== currentBuildId) {
    // New deploy detected while user is on an old SPA bundle — reload to pick up latest code.
    window.location.reload();
    return;
  }

  // Persist current build id for future navigations
  localStorage.setItem(STORAGE_KEY, currentBuildId);
});



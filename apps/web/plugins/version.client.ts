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

  // Also compare against server build id in case the HTML/bundle is stale
  // (e.g., navigated from a cached root index to a newer page)
  const checkServerBuildId = async () => {
    try {
      const res = await fetch("/api/build-id", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { buildId?: string };
      if (data.buildId && data.buildId !== currentBuildId) {
        window.location.reload();
      }
    } catch {
      // ignore network errors
    }
  };

  // Run once shortly after mount
  setTimeout(checkServerBuildId, 250);

  // And on client-side route changes
  const router = useRouter();
  router.afterEach(() => {
    setTimeout(checkServerBuildId, 0);
  });
});



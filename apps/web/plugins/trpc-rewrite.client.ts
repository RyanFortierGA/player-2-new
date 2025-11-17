export default defineNuxtPlugin(() => {
  if (!import.meta.env.PROD) return;
  if (typeof window === "undefined") return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
      if (rawUrl.startsWith("/api/trpc")) {
        const rewritten = `/.netlify/functions/server${rawUrl}`;
        if (typeof input === "string" || input instanceof URL) {
          return originalFetch(rewritten, init);
        }
        // input is a Request
        const req = input as Request;
        const newReq = new Request(rewritten, {
          method: req.method,
          headers: req.headers,
          body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
          mode: req.mode,
          credentials: req.credentials,
          cache: req.cache,
          redirect: req.redirect,
          referrer: req.referrer,
          referrerPolicy: req.referrerPolicy,
          integrity: req.integrity,
          keepalive: (req as any).keepalive,
          signal: req.signal,
        });
        return originalFetch(newReq);
      }
    } catch {
      // fall through to original fetch on any error
    }
    return originalFetch(input as any, init);
  };
});



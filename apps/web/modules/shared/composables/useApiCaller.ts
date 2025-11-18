import superjson from "superjson";
import { joinURL } from "ufo";
import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";
import type { ApiRouter } from "api/modules/trpc";

export const useApiCaller = () => {
  const isProd = import.meta.env.PROD;
  const runtimeConfig = useRuntimeConfig();
  const trpcUrl = isProd
    ? joinURL(runtimeConfig.public.siteUrl, "/.netlify/functions/server/trpc")
    : "/api/trpc";
  const apiCaller = createTRPCNuxtClient<ApiRouter>({
    links: [
      httpBatchLink({
        url: trpcUrl,
        transformer: superjson,
      }),
    ],
  });

  return { apiCaller };
};

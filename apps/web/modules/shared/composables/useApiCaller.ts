import superjson from "superjson";
import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";
import type { ApiRouter } from "api/modules/trpc";

export const useApiCaller = () => {
  const isProd = import.meta.env.PROD;
  const trpcBase = isProd ? "/.netlify/functions/server" : "";
  const apiCaller = createTRPCNuxtClient<ApiRouter>({
    links: [
      httpBatchLink({
        url: `${trpcBase}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });

  return { apiCaller };
};

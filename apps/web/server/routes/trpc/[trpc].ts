import { createTRPCNuxtHandler } from "trpc-nuxt/server";
import { apiRouter, createContext } from "api/modules/trpc";
import { logger } from "logs";

export default createTRPCNuxtHandler({
  router: apiRouter,
  createContext,
  endpoint: "/trpc",
  onError: ({ error }) => {
    logger.error(error);
  },
});



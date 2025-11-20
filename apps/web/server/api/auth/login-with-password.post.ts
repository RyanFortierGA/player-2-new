import { defineEventHandler, readBody } from "h3";
import { apiRouter, createContext } from "api/modules/trpc";
import { createCallerFactory } from "api/modules/trpc/trpc";

const createCaller = createCallerFactory(apiRouter);

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event);
  const ctx = await createContext(event);
  const caller = createCaller(ctx);
  const result = await caller.auth.loginWithPassword({
    email: body.email,
    password: body.password,
  });
  return result;
});




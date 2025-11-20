import { defineEventHandler, readBody } from "h3";
import { apiRouter, createContext } from "api/modules/trpc";
import { createCallerFactory } from "api/modules/trpc/trpc";

const createCaller = createCallerFactory(apiRouter);

type TRPCBatchBody =
  | { 0?: { json?: { email?: string; password?: string } } }
  | { input?: { email?: string; password?: string } }
  | { email?: string; password?: string };
   

export default defineEventHandler(async (event) => {
  const raw = (await readBody(event)) as TRPCBatchBody | null;
  const maybe =
    (raw && (raw as any)[0]?.json) ||
    (raw && (raw as any).input) ||
    raw ||
    {};
  const email = (maybe as any).email as string | undefined;
  const password = (maybe as any).password as string | undefined;

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: "Missing email or password" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const ctx = await createContext(event);
  const caller = createCaller(ctx);
  const result = await caller.auth.loginWithPassword({ email, password });
  return result;
});



import { defineEventHandler, readBody, setCookie } from "h3";
import { createClient } from "@supabase/supabase-js";
import { db } from "database";
import { createSession, createSessionCookie, generateSessionToken } from "auth";

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

  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data?.session?.access_token) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const existingUser = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      role: true,
      avatarUrl: true,
    },
  });

  if (!existingUser) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  if (!existingUser.emailVerified) {
    return new Response(JSON.stringify({ error: "Email not verified" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const sessionToken = generateSessionToken();
  await createSession(sessionToken, existingUser.id);
  const sessionCookie = createSessionCookie(sessionToken);
  setCookie(
    event,
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return new Response(
    JSON.stringify({ user: existingUser }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
});



import { defineEventHandler, getHeader, setCookie } from "h3";
import { createClient } from "@supabase/supabase-js";
import { db } from "database";
import {
  createSession,
  createSessionCookie,
  generateSessionToken,
} from "auth";

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null) || null;

  if (!token) {
    return new Response(JSON.stringify({ error: "Missing access token" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
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
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.email) {
    return new Response(JSON.stringify({ error: "Invalid access token" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const email = data.user.email.toLowerCase();
  const existingUser = await db.user.findUnique({
    where: { email },
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
    JSON.stringify({
      user: existingUser,
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
});




import { defineEventHandler } from "h3";

export default defineEventHandler((event) => {
  const runtime = useRuntimeConfig();
  const buildId = (runtime.public as any).buildId ?? "unknown";
  return new Response(JSON.stringify({ buildId }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
});



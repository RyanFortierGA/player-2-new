const getBaseUrl = () => {
  var _a;
  if (process.env.NUXT_PUBLIC_SITE_URL) {
    return process.env.NUXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${(_a = process.env.PORT) != null ? _a : 3e3}`;
};

export { getBaseUrl as g };
//# sourceMappingURL=base-url.mjs.map

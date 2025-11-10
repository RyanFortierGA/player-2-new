import path from "node:path";
import { getBaseUrl } from "utils";
import { config } from "../../config";
import tailwindcss from "@tailwindcss/vite";

const baseUrl = getBaseUrl();

export default defineNuxtConfig({
  compatibilityDate: "2025-07-07",

  nitro: {
    preset: "netlify",
    prerender: {
      // We are generating a static site for Netlify "dist" publishing.
      // Disable crawling and explicitly list safe routes to avoid build-time 404s.
      crawlLinks: false,
      routes: ["/", "/rules", "/league/leaderboard", "/league/schedule"],
      ignore: [
        "/team/invitation",
        "/legal/privacy-policy",
        "/app/**",
        "/auth/**",
        "/api/**",
        "/teams/**",
      ],
      failOnError: false,
    },
  },

  // Route rules for static generation and redirects
  routeRules: {
    "/legal/privacy-policy": { redirect: { to: "/legal/privacy", statusCode: 301 } },
  },

  devtools: {
    enabled: true,
  },

  alias: {
    "@config": path.resolve(__dirname, path.join("..", "..", "config")),
    "utils": path.resolve(__dirname, path.join("..", "..", "packages", "utils")),
  },

  css: ["~/assets/css/main.css"],

  experimental: {
    typedPages: true,
    cookieStore: false,
  },

  runtimeConfig: {
    public: {
      siteUrl: baseUrl,
      s3AvatarsBucketName: process.env.NUXT_PUBLIC_S3_AVATARS_BUCKET_NAME,
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      analytics: {
        googleAnalyticsId: process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID,
        mixpanelToken: process.env.NUXT_PUBLIC_MIXPANEL_TOKEN,
        pirschCode: process.env.NUXT_PUBLIC_PIRSCH_CODE,
        plausibleUrl: process.env.NUXT_PUBLIC_PLAUSIBLE_URL,
        umamiTrackingId: process.env.NUXT_PUBLIC_UMAMI_TRACKING_ID,
      },
      auth: {
        redirectPath: "/app/team",
      },
    },
  },

  imports: {
    dirs: [
      "modules/saas/auth/composables/**",
      "modules/saas/dashboard/composables/**",
      "modules/saas/shared/**",
      "modules/shared/composables/**",
      "modules/shared/utils/**",
      "modules/ui/lib/**",
      "modules/marketing/shared/util/**",
      "modules/marketing/content/**",
    ],
  },

  components: [
    { path: "@/modules/shared/components", pathPrefix: false },
    { path: "@/modules/marketing/shared/components", pathPrefix: false },
    { path: "@/modules/marketing/home/components", pathPrefix: false },
    { path: "@/modules/marketing/blog/components", pathPrefix: false },
    { path: "@/modules/marketing/faq/components", pathPrefix: false },
    { path: "@/modules/marketing/changelog/components", pathPrefix: false },
    { path: "@/modules/marketing/content/components", pathPrefix: false },
    { path: "@/modules/marketing/pricing/components", pathPrefix: false },
    { path: "@/modules/saas/admin/components", pathPrefix: false },
    { path: "@/modules/saas/auth/components", pathPrefix: false },
    { path: "@/modules/saas/dashboard/components", pathPrefix: false },
    { path: "@/modules/saas/onboarding/components", pathPrefix: false },
    { path: "@/modules/saas/settings/components", pathPrefix: false },
    { path: "@/modules/saas/shared/components", pathPrefix: false },
  ],

  app: {
    head: {
      title: "Player 2",
      titleTemplate: "%s - Player 2",
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
        },
      ],
    },
  },

  build: {
    transpile: ["trpc-nuxt"],
  },

  modules: [
    "@nuxtjs/i18n",
    "@nuxtjs/google-fonts",
    "@nuxtjs/color-mode",
    "@nuxt/content",
    "@nuxt/image",
    "@vue-email/nuxt",
    "shadcn-nuxt",
    "@nuxtjs/seo",
    "@vee-validate/nuxt",
    "@vueuse/nuxt",
  ],

  i18n: {
    locales: Object.entries(config.i18n.locales).map(([code, locale]) => ({
      code,
      file: `${code}.json`,
      name: locale.label,
    })),
    defaultLocale: config.i18n.defaultLocale,
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: config.i18n.cookieName,
      redirectOn: "root",
    },
    baseUrl,
    langDir: "../../../packages/i18n/translations",
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  // @nuxtjs/google-fonts
  googleFonts: {
    display: "swap",
    families: {
      Geist: [400, 500, 600, 700],
    },
  },

  // @nuxtjs/color-mode
  colorMode: {
    preference: "dark",
    fallback: "dark",
    classSuffix: "",
    storageKey: "NUXT_COLOR_MODE",
  },

  // @nuxt/content
  content: {
    markdown: {
      anchorLinks: false,
    },
  },

  // @nuxt/image
  image: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },

  shadcn: {
    prefix: "",
    componentDir: "./modules/ui/components",
  },

  // nuxt-simple-robots
  robots: {
    allow: "*",
    // sitemap: 'sitemap.xml',
  },

  // @vue-email/nuxt
  vueEmail: {
    baseUrl,
  },

  // @vee-validate/nuxt
  veeValidate: {
    // disable or enable auto imports
    autoImports: true,
    // Use different names for components
    componentNames: {
      Form: "Form",
      Field: "FormField",
      ErrorMessage: "ErrorMessage",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});

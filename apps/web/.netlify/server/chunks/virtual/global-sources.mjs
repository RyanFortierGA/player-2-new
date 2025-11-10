const sources = [
    {
        "context": {
            "name": "sitemap:urls",
            "description": "Set with the `sitemap.urls` config."
        },
        "urls": [],
        "sourceType": "user"
    },
    {
        "context": {
            "name": "@nuxt/content@v2:urls",
            "description": "Generated from your markdown files.",
            "tips": [
                "You can provide a `sitemap` key in your markdown frontmatter to configure specific URLs. Make sure you include a `loc`."
            ]
        },
        "fetch": "/__sitemap__/nuxt-content-urls.json",
        "sourceType": "app"
    },
    {
        "context": {
            "name": "nuxt:pages",
            "description": "Generated from your static page files.",
            "tips": [
                "Can be disabled with `{ excludeAppSources: ['nuxt:pages'] }`."
            ]
        },
        "urls": [
            {
                "loc": "/"
            },
            {
                "loc": "/rules"
            },
            {
                "loc": "/auth/otp"
            },
            {
                "loc": "/app/admin"
            },
            {
                "loc": "/app/admin/users"
            },
            {
                "loc": "/app"
            },
            {
                "loc": "/dashboard"
            },
            {
                "loc": "/auth/login"
            },
            {
                "loc": "/onboarding"
            },
            {
                "loc": "/auth/signup"
            },
            {
                "loc": "/auth/verify"
            },
            {
                "loc": "/team/create"
            },
            {
                "loc": "/app/settings"
            },
            {
                "loc": "/app/settings/team/billing"
            },
            {
                "loc": "/app/settings/team/general"
            },
            {
                "loc": "/app/settings/team/members"
            },
            {
                "loc": "/app/settings/account/general"
            },
            {
                "loc": "/app/team"
            },
            {
                "loc": "/league/schedule"
            },
            {
                "loc": "/team/invitation"
            },
            {
                "loc": "/app/ai-demo"
            },
            {
                "loc": "/league/leaderboard"
            },
            {
                "loc": "/app/dashboard"
            },
            {
                "loc": "/auth/forgot-password"
            },
            {
                "loc": "/legal/privacy-policy"
            }
        ],
        "sourceType": "app"
    },
    {
        "context": {
            "name": "nuxt:prerender",
            "description": "Generated at build time when prerendering.",
            "tips": [
                "Can be disabled with `{ excludeAppSources: ['nuxt:prerender'] }`."
            ]
        },
        "urls": [
            "/",
            "/rules",
            "/league/leaderboard",
            "/league/schedule",
            null,
            null,
            null,
            null
        ],
        "sourceType": "app"
    }
];

export { sources };
//# sourceMappingURL=global-sources.mjs.map

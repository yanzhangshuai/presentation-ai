import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
// import { visualizer } from 'rollup-plugin-visualizer'

export default defineNuxtConfig({
  compatibilityDate: '2025-11-20',
  devtools         : { enabled: true },
  modules          : [
    '@pinia/nuxt',
    '@sidebase/nuxt-auth',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/ui',
  ],

  routeRules: {
    // '/presentation/**': { ssr: false },
  },

  devServer: {
    port: 3080,
  },

  runtimeConfig: {
    // auth 相关配置
    authSecret: process.env.AUTH_SECRET,

    googleClientId    : process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,

    githubClientId    : process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,

    // model 相关 API Key
    openaiApiKey  : process.env.OPENAI_API_KEY,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,

    public: {
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        less: {
          // 如果需要全局变量 / mixin，可在这里配置
          additionalData: `@import "@/assets/less/variables.less";`,
        },
      },
    },
    plugins: [
      tailwindcss(),
    ],
    build: {
      rollupOptions: {
        plugins: [
          // visualizer({ filename: 'stats.html', open: true }),
        ],
      },
    },
  },
  css: [
    '~/assets/css/tailwind.css',
    '~/assets/less/main.less',
  ],
  i18n: {
    defaultLocale: 'en',
    strategy     : 'prefix_except_default',
    locales      : [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.ts' },
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.ts' },
      { code: 'zh-hk', language: 'zh-HK', name: '中文（香港）', file: 'zh-hk.ts' },
      { code: 'jp', language: 'ja-JP', name: '日本語', file: 'jp.ts' },
    ],
  },

  auth: {
    baseURL: process.env.AUTH_ORIGIN,
  },

  ui: {
    fonts: false,   // 禁用 Google Fonts 加载
    theme: {
      colors: [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'error',
        'neutral',
      ],
    },
  },
  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir   : './app/assets/icons',
      },
    ],
  },

})

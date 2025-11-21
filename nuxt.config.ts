import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
// import { visualizer } from 'rollup-plugin-visualizer'

export default defineNuxtConfig({
  compatibilityDate: '2025-11-20',
  devtools         : { enabled: true },
  modules          : [
    '@pinia/nuxt',
    '@sidebase/nuxt-auth',
    // 'unplugin-icons/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/ui',
  ],

  devServer: {
    port: 3010,
  },

  runtimeConfig: {
    // 私有配置，只在服务器端可用
    authSecret: process.env.AUTH_SECRET,

    googleClientId    : process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,

    githubClientId    : process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    // 公共配置，客户端和服务器端都可用
    public            : {
      // 可以在这里添加需要在客户端访问的配置
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
  css: [
    '~/assets/css/tailwind.css',
    '~/assets/less/main.less',
  ],

})

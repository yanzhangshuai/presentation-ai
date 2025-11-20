import IconsResolver from 'unplugin-icons/resolver'
// import { visualizer } from 'rollup-plugin-visualizer'
import ViteComponents from 'unplugin-vue-components/vite'

import { getI18nFiles } from './build/util'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools         : { enabled: true },
  modules          : [
    '@unocss/nuxt',
    '@pinia/nuxt',
    'unplugin-icons/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
  ],

  devServer: {
    host: '0.0.0.0',
    port: 3010,
  },
  vite: {
    plugins: [
      ViteComponents({
        resolvers: [
          IconsResolver({
            componentPrefix: '',
          }),
        ],
        dts: true,
      }),
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
      { code: 'en', language: 'en-US', name: 'English', files: getI18nFiles('en') },
      { code: 'zh', language: 'zh-CN', name: '中文', files: getI18nFiles('zh') },
      { code: 'zh-hk', language: 'zh-HK', name: '中文（香港）', files: getI18nFiles('zh-hk') },
      { code: 'jp', language: 'ja-JP', name: '日本語', files: getI18nFiles('jp') },
    ],
  },
})

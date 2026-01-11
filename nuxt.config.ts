import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-11-20',

  devtools: { enabled: true },

  experimental: {
    /**
     * 启用 Early Hints 支持，提升首屏加载速度
     */
    writeEarlyHints         : true,
    /**
     * 启用有效负载提取，减少初始 HTML 大小
     */
    payloadExtraction       : true,
    /**
     * 启用异步数据提取处理器，提升 SSR 性能
     */
    extractAsyncDataHandlers: true,
  },

  modules: [
    '@pinia/nuxt',
    '@sidebase/nuxt-auth',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/ui',
    '@uploadthing/nuxt',
  ],

  components: [
    { path: '~/components/ui', prefix: 'UI' },
    { path: '~/components/common' },

    '~/components',
  ],

  routeRules: {
    // '/presentation/**': { ssr: false },
  },

  devServer: {
    port: 3080,
  },

  router: {
    options: {
      // prefetchLinks: 'hover',
    },
  },

  nitro: {
    compressPublicAssets: true,
  },

  runtimeConfig: {

    databaseUrl: process.env.DATABASE_URL,

    // auth 相关配置
    authSecret: process.env.AUTH_SECRET,

    googleClientId    : process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,

    githubClientId    : process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,

    // model 相关 API Key
    openaiApiKey  : process.env.OPENAI_API_KEY,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,

    //  阿里云 OSS 配置
    aliyunOss: {
      accessKeyId    : process.env.ALIYUN_OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET || '',
      bucketName     : process.env.ALIYUN_OSS_BUCKET_NAME || '',
      region         : process.env.ALIYUN_OSS_REGION || '',
      roleArn        : process.env.ALIYUN_OSS_ROLE_ARN || '',
    },

    // 火山引擎
    volc: {
      accessKeyId    : process.env.VOLC_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.VOLC_ACCESS_KEY_SECRET || '',
    },

    // 阿里云百练
    aliyunBailianApiKey: process.env.ALIYUN_BAILIAN_API_KEY || '',

    // UploadThing 配置
    uploadthingSecret: process.env.UPLOADTHING_SECRET,

    // Unsplash API 密钥
    unsplash: {
      accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
      secretKey: process.env.UNSPLASH_SECRET_KEY || '',
    },

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
      chunkSizeWarningLimit: 300,
      sourcemap            : true,

      rollupOptions: {
        output: {
          chunkFileNames: '_nuxt/[name]-[hash].js',
          manualChunks(id) {
            // 只有 node_modules 中的包才参与手动分包
            const isNodeModule = id.includes('node_modules')
            const isNuxtInternal = id.includes('virtual:nuxt') || id.includes('.cache/nuxt')

            if (!isNodeModule && !isNuxtInternal)
              return

            const groups = [
              {
                name    : 'chunk-editor', // Tiptap 编辑器相关（重，仅编辑页用）
                priority: 100,
                test    : [
                  /tiptap/,
                  /prosemirror/,
                  /yjs/,
                  /markdown-it/,
                  /linkifyjs/,
                ],
              },
              {
                name    : 'chunk-oss', // 存储相关（大，按需加载）
                priority: 90,
                test    : [/ali-oss/],
              },

              // {
              //   // 2. 增强 UI 核心包：包含底层库、图标库以及 Nuxt UI 本身的运行时
              //   name    : 'chunk-ui-core',
              //   priority: 85, // 优先级稍微调高
              //   test    : [
              //     /reka-ui/,
              //     /@nuxt[\\/]ui/,     // 捕获 Nuxt UI 物理文件
              //     /@nuxt[\\/]icon/,   // 捕获图标运行时
              //     /virtual:nuxt/,     // 捕获 Nuxt UI 虚拟组件 (关键!)
              //     /@floating-ui/,
              //     /vue-lucide/,
              //     /tailwind-variants/,
              //   ],
              // },
              {
                name    : 'chunk-draggable', // 拖拽库
                priority: 70,
                test    : [
                  /vue-draggable-plus/,
                  /sortablejs/,
                ],
              },
              {
                name    : 'chunk-core', // 核心框架（每个页面都用，适合缓存）
                priority: 60,
                test    : [
                  /[\\/]vue[\\/]/,
                  /[\\/]@vue[\\/]/,
                  /[\\/]vue-router[\\/]/,
                  /[\\/]pinia[\\/]/,
                  /[\\/]@pinia[\\/]/,
                  /[\\/]vue-i18n[\\/]/,
                ],
              },

              // 【策略调整】UI 库分包：
              // 这里我们只打包 UI 框架中最基础的底层库（Reka UI 核心和 Icons）
              // 具体的组件（如 UModal, UDatePicker）让 Vite 自动处理，不强制合并

              // {
              //   name    : 'chunk-utils', // 通用工具库
              //   priority: 50,
              //   test    : [
              //     /lodash/,
              //     /dayjs/,
              //     /axios/,
              //     /p-limit/,
              //     /valibot/,
              //     /uuid/,
              //   ],
              // },

            ]

            // 按优先级排序并匹配
            const sortedGroups = groups.sort((a, b) => b.priority - a.priority)
            for (const group of sortedGroups) {
              if (group.test.some(pattern => pattern.test(id))) {
                return group.name
              }
            }
          },
        },
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

  uploadthing: {
    routerPath: '~/server/providers/uploadthing/core', // The path for your uploadthing server api route

  },
})

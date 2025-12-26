# AI Presentation Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nuxt.js](https://img.shields.io/badge/Nuxt.js-000000?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tiptap](https://img.shields.io/badge/Tiptap-3B82F6?logoColor=white)](https://tiptap.dev/)

一款仿 [![ALLWEONE® AI Presentation Generator](https://img.shields.io/badge/ALLWEONE%C2%AE%20AI%20Presentation%20Generator-000000?logo=nuxt.js&logoColor=white)](https://github.com/allweonedev/presentation-ai) 的智能演示文稿生成器，基于 Nuxt 3 + Tailwind CSS + Tiptap 构建，集成阿里云百炼与火山引擎 AI 能力，实现从内容生成到排版编辑的一站式 PPT 生产流程。

  ## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

<pre style="font-family: monospace; padding: 10px;">
presentation-ai/
├─ app/                     # ── 客户端目录
│  ├─ assets/               # 样式、图片、字体等
│  │  ├─ css/              # 全局样式文件
│  │  ├─ fonts/            # 字体文件
│  │  └─ icons/            # 图标资源
│  ├─ components/           # Vue 组件（自动导入）
│  │  ├─ DashboardExamples.vue # 示例组件
│  │  ├─ DashboardInput.vue    # 输入组件
│  │  ├─ editor/              # 编辑器相关组件
│  │  ├─ presentation/        # 演示文稿相关组件
│  │  └─ ui/                  # 通用 UI 组件
│  ├─ composables/          # 组合式函数 useXxx
│  │  ├─ useAppTheme.ts      # 应用主题相关逻辑
│  │  ├─ useEditor.ts        # 编辑器逻辑
│  │  └─ useUploader.ts      # 上传逻辑
│  ├─ layouts/              # 布局文件 default.vue 等
│  ├─ middleware/           # 页面或路由中间件
│  ├─ pages/                # 页面路由文件
│  │  ├─ index.vue          # 首页
│  │  ├─ auth/              # 认证相关页面
│  │  └─ presentation/      # 演示文稿相关页面
│  ├─ plugins/              # 插件初始化
│  ├─ app.vue               # 根组件
│  └─ error.vue             # 错误页面
│
├─ server/                   # ── 服务端目录
│  ├─ api/                  # API 路由
│  ├─ middleware/           # 服务端中间件
│  └─ utils/                # 服务端工具函数
│
├─ public/                   # ── 原样输出的静态资源
│  ├─ fonts/                # 字体资源
│  └─ robots.txt            # 爬虫协议文件
├─ modules/                  # 自定义 Nuxt 模块
├─ shared/                   # 项目共享代码/工具函数
├─ i18n/                     # 国际化资源
│  ├─ locales/              # 语言文件
│  │  ├─ en.ts              # 英文
│  │  ├─ zh.ts              # 简体中文
│  │  └─ jp.ts              # 日文
│  └─ translate.cache.json  # 翻译缓存
├─ db/                       # 数据库脚本 / 迁移
│  ├─ schema.prisma         # Prisma 数据库模式
│  ├─ seed.ts               # 数据库种子脚本
│  └─ migrations/           # 数据库迁移文件
├─ build/                    # 构建输出或构建脚本
├─ scripts/                  # 自定义脚本（自动化、迁移等）
│  ├─ i18n.js               # 国际化相关脚本
│  ├─ postinstall.js        # 安装后脚本
│  └─ ecosystem.config.cjs  # PM2 配置文件
├─ nuxt.config.ts            # Nuxt 配置
├─ tsconfig.json             # TypeScript 配置
├─ eslint.config.js          # ESLint 配置s
├─ package.json              # 项目依赖及脚本
├─ pnpm-lock.yaml            # pnpm 锁文件
└─ README.md                 # 项目说明
</pre>

## 阿里云 OSS 配置
1. 创建 RAM账号，并获取 AccessKeyId 和 AccessKeySecret
2. 创建 OSS Bucket，并配置跨域规则
3. 创建 RAM 角色，授权 OSS 访问权限，获取 RoleArn
4. 在 .env 文件中配置
ALIYUN_OSS_ACCESS_KEY_ID: 阿里云 RAM 账号的 AccessKeyId
ALIYUN_OSS_ACCESS_KEY_SECRET: 阿里云 RAM 账号的 AccessKeySecret
ALIYUN_OSS_BUCKET_NAME: OSS Bucket 名称
ALIYUN_OSS_REGION: OSS Bucket 所在区域
ALIYUN_OSS_ROLE_ARN: RAM 角色的 RoleArn
## 阿里云百练
1. 注册并登录阿里云百练平台
2. 创建应用，获取 API Key
3. 在 .env 文件中配置
ALIYUN_BAILIAN_API_KEY: 阿里云百练应用的 API Key
### 火山引擎配置
1. 注册并登录火山引擎平台
2. 创建访问密钥，获取 AccessKeyId 和 AccessKeySecret
3. 在 .env 文件中配置 VOLC_ACCESS_KEY_ID 和 VOLC_ACCESS_KEY_SECRET

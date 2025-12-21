# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

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

my-nuxt-app/
├─ app/                     # ── Nuxt 源码目录
│  ├─ assets/               # 样式、图片、字体等
│  ├─ components/           # Vue 组件（自动导入）
│  ├─ composables/          # 组合式函数 useXxx
│  ├─ layouts/              # 布局文件 default.vue 等
│  ├─ middleware/           # 页面或路由中间件
│  ├─ pages/                # 页面路由文件
│  ├─ plugins/              # 插件初始化
│  ├─ app.vue               # 根组件
│  └─ error.vue             # 错误页面（可选）
│
├─ server/                   # ── 服务端目录
│  ├─ api/                  # API 路由
│  └─ middleware/           # 服务端中间件
│
├─ public/                   # ── 原样输出的静态资源
├─ modules/                  # 自定义 Nuxt 模块
├─ shared/                   # 项目共享代码/工具函数
├─ i18n/                     # 国际化资源
├─ db/                       # 数据库脚本 / 迁移
├─ build/                    # 构建输出或构建脚本
├─ scripts/                  # 自定义脚本（自动化、迁移等）
├─ nuxt.config.ts            # Nuxt 配置
├─ tsconfig.json             # TypeScript 配置
├─ eslint.config.js          # ESLint 配置
├─ unocss.config.ts          # UnoCSS 配置
├─ package.json              # 项目依赖及脚本
├─ pnpm-lock.yaml            # pnpm 锁文件
└─ README.md                 # 项目说明

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

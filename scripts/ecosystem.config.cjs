module.exports = {
  apps: [
    {
      name  : 'presentation-ai',               // ← PM2 进程名称
      script: '.output/server/index.mjs',
      env   : {
        NODE_ENV: 'development',
        PORT    : 3010,                      // ← 开发或通用启动端口
      },
      env_production: {
        NODE_ENV: 'production',
        PORT    : 3010,                      // ← 生产端口（你想用哪个都可以）
      },
    },
  ],
}

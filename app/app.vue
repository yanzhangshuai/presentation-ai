<script setup lang="ts">
useAppTheme()

// 2) SSR 输出时插入首屏脚本（避免闪烁）
useHead({
  script: [
    {
      innerHTML: `
        (function() {
          try {
            const key = 'presentation-ai_app-theme';
            const saved = localStorage.getItem(key);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = saved || (prefersDark ? 'dark' : 'light');
            document.documentElement.classList.add(theme);
          } catch (_) {}
        })()
      `,
      type: 'application/javascript',
    },
  ],
})
</script>

<!-- 在 SSR 输出 HTML 时插入预处理脚本 -->
<template>
  <div>
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>

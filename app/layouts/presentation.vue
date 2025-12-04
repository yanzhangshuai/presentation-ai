<script setup lang="ts">
// ------------------------------
// Imports & Composables
// ------------------------------
const router = useRouter()
const localRoute = useLocaleRoute()

// 用户认证状态
const { status } = useAuth()

// 主题相关
const { isDark } = useAppTheme()

// 演示文稿状态
const { presentation } = usePresStore()
const { colors, theme } = storeToRefs(usePresThemeStore())

// ------------------------------
// 未认证用户重定向
// ------------------------------
// 这里直接在 setup 中判断一次，如果 status 是响应式的，
// 可改为 watchEffect 监听，保证状态变化也能触发重定向
if (toValue(status) === 'unauthenticated') {
  router.push(localRoute('/'))
}

// ------------------------------
// 背景生成函数
// ------------------------------
/**
 * 根据主题色和深浅模式生成页面背景
 * @param isDark 是否为深色模式
 * @param colors 当前主题颜色对象
 */
const getBackground = (isDark: boolean, colors: ThemeColors) => {
  // 定义不同模式下颜色透明度
  const opacity = isDark
    ? { primary: '20', accent: '20', secondary: '15' }
    : { primary: '15', accent: '15', secondary: '10' }

  return `
    radial-gradient(circle at 10% 10%, ${colors.primary}${opacity.primary} 0%, transparent 30%),
    radial-gradient(circle at 90% 20%, ${colors.accent}${opacity.accent} 0%, transparent 40%),
    radial-gradient(circle at 50% 80%, ${colors.secondary}${opacity.secondary} 0%, transparent 50%),
    var(--presentation-background)
  `
}

// ------------------------------
// 响应式背景
// ------------------------------
const bg = computed(() => getBackground(toValue(isDark), toValue(colors)))
</script>

<template>
  <!-- 顶部导航 -->
  <UHeader mode="slideover">
    <template #left>
      <!-- logo -->
      <NuxtLinkLocale to="/" class="text-xl i-flex-center">
        <UIcon name="i-custom-headache" />
      </NuxtLinkLocale>

      <!-- 分隔符 -->
      <UIcon name="i-lucide-chevron-right" />

      <!-- 演示文稿标题 -->
      <span class="fill-dbi tracking-wide font-[AmericanTypewriter]">
        {{ presentation?.base.title }}
      </span>
    </template>

    <template #right>
      <UserAvatar />
    </template>
  </UHeader>

  <!-- 内容容器 -->
  <div
    class="h-max min-h-full w-full"
    :style="{
      background: bg, // 响应式背景
      transition: theme.transitions.default, // 平滑过渡
      color: colors.text, // 文字颜色
    }"
  >
    <slot />
  </div>
</template>

<style lang="less" scoped>
/* 自定义字体 */
@font-face {
  font-family: "AmericanTypewriter";
  src: url("~/assets/fonts/American_Typewriter.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}
</style>

<script setup lang="ts">
const { toggleTheme } = useTheme()

const { signIn, status } = useAuth()

const items = ref([
  {
    label: 'Guide',
    icon : 'i-lucide-book-open',
    to   : '/docs/getting-started',

  },
  {
    label: 'Composables',
    icon : 'i-lucide-database',
    to   : '/docs/composables',

  },
  {
    label: 'Components',
    icon : 'i-lucide-box',
    to   : '/docs/components',

  },
  {
    label : 'GitHub',
    icon  : 'i-simple-icons-github',
    badge : '3.8k',
    to    : 'https://github.com/nuxt/ui',
    target: '_blank',
  },
  {
    label   : 'Help',
    icon    : 'i-lucide-circle-help',
    disabled: true,
  },
])
</script>

<template>
  <UHeader mode="slideover">
    <template #left>
      <!-- logo -->
      <NuxtLinkLocale to="/" class="text-xl i-flex-center">
        <UIcon name="i-lucide-hop" class="mr-2" />
        <span class="fill-dbi tracking-wide font-[AmericanTypewriter] ">
          {{ $t('common.logo') }}
        </span>
      </NuxtLinkLocale>
    </template>

    <UNavigationMenu :items="items" />

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>

    <template #right>
      <!-- 未登录 -->
      <USpace v-if="status === 'unauthenticated'" class="i-flex-center">
        <!-- 主题切换 -->
        <UButton variant="ghost" color="neutral" class="cursor-pointer relative" @click="toggleTheme">
          <UIcon name="i-lucide-sun" class="text-2xl scale-100  dark:scale-0" />
          <UIcon name="i-lucide-moon" class="absolute text-2xl scale-0 dark:scale-100" />
        </UButton>

        <!-- 语言选择器 -->
        <LanguageSwitch />

        <!-- 登录 -->
        <NuxtLinkLocale to="/auth/login">
          <UButton variant="solid" color="neutral" class="cursor-pointer" @click="signIn('github')">
            <UIcon name="i-lucide-github" class="text-base" />
            {{ $t('auth.loginGithub') }}
          </UButton>
        </NuxtLinkLocale>
      </USpace>

      <!-- 已登录 -->
      <UserAvatar v-else />
    </template>
  </UHeader>

  <slot />
</template>

<style lang="less" scoped>
@font-face {
  font-family: "AmericanTypewriter";
  src: url("~/assets/fonts/American_Typewriter.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}
</style>

<script setup lang="ts">
const { toggleTheme } = useAppTheme()
const { status } = useAuth()
const route = useRoute()

const items = [
  { label: 'Guide', icon: 'i-lucide-book-open', to: '#' },
  { label: 'Composables', icon: 'i-lucide-database', to: '#' },
  { label: 'Components', icon: 'i-lucide-box', to: '#' },
  {
    label : 'GitHub',
    icon  : 'i-simple-icons-github',
    badge : '0',
    to    : 'https://github.com/yanzhangshuai/presentation-ai',
    target: '_blank',
  },
  { label: 'Help', icon: 'i-lucide-circle-help', disabled: true },
]

const callbackUrl = computed(() =>
  `/auth/signin?callbackUrl=${encodeURIComponent(route.fullPath)}`,
)
</script>

<template>
  <UHeader mode="slideover" :toggle="false">
    <!-- 左侧Logo -->
    <template #left>
      <NuxtLinkLocale to="/" class="text-xl i-flex-center">
        <UIcon name="i-lucide-audio-waveform" class="mr-2" />
        <span class="fill-dbi tracking-wide font-[AmericanTypewriter]">
          {{ $t('common.logo') }}
        </span>
      </NuxtLinkLocale>
    </template>

    <!-- 右侧 -->
    <template #right>
      <!-- 未登录 -->
      <div v-if="status === 'unauthenticated'" class="i-flex-center space-x-2">
        <!-- 主题切换 -->
        <UButton variant="ghost" color="neutral" class="cursor-pointer" @click="toggleTheme">
          <UIcon name="i-lucide-sun" class="text-2xl dark:hidden" />
          <UIcon name="i-lucide-moon" class="text-2xl hidden dark:block" />
        </UButton>

        <!-- 语言切换 -->
        <LanguageSwitch />

        <!-- 登录 -->
        <NuxtLinkLocale :to="callbackUrl">
          <UButton variant="solid" color="neutral" class="cursor-pointer">
            <UIcon name="i-lucide-log-in" class="text-base" />
            {{ $t('auth.login') }}
          </UButton>
        </NuxtLinkLocale>
      </div>

      <!-- 已登录 -->
      <UserAvatar v-else />
    </template>

    <!-- 导航 -->
    <UNavigationMenu :items="items" />
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>

  <main><slot /></main>
</template>

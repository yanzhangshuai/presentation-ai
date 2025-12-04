<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

/* ------------------ 国际化 & 主题 ------------------ */
// i18n: t 用于翻译，locale 当前语言，locales 支持的语言列表，setLocale 切换语言
const { t, locale, locales, setLocale } = useI18n()
// 主题: isDark 当前是否暗黑模式，toggleTheme 切换主题
const { isDark, toggleTheme } = useAppTheme()

/* ------------------ Auth ------------------ */
// signOut: 退出登录方法
// data: 当前登录用户信息
const { signOut, data } = useAuth()

/* ------------------ 用户信息 ------------------ */
// 计算属性获取用户信息，方便模板和逻辑使用
const user = computed(() => toValue(data)?.user)

/* ------------------ 语言切换菜单 ------------------ */
// 根据 locales 动态生成语言切换子菜单
const langItems = computed<DropdownMenuItem[]>(() =>
  toValue(locales).map(l => ({
    label   : l.name, // 显示语言名称
    disabled: l.code === toValue(locale), // 当前语言禁用
    class   : 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800',
    onSelect: () => setLocale(l.code), // 点击切换语言
  })),
)

/* ------------------ 用户菜单配置 ------------------ */
const items = computed<DropdownMenuItem[][]>(() => {
  const u = toValue(user)
  if (!u)
    return [] // 用户未登录时返回空菜单

  return [
    // 用户信息显示区域
    [
      {
        label      : u.name || '', // 用户名
        type       : 'label', // 标识为标签类型，不可点击
        description: u.email || '', // 用户邮箱
        avatar     : { size: 'xl', src: u.image || '' }, // 用户头像
      },
    ],
    // 功能菜单
    [
      { label: t('auth.profile'), icon: 'i-lucide-user', class: 'cursor-pointer' }, // 个人资料
      {
        label   : t('common.changeLanguage') || '', // 切换语言
        icon    : 'i-lucide-globe',
        class   : 'cursor-pointer',
        children: toValue(langItems), // 子菜单为语言列表
      },
      {
        label   : t('common.changeTheme') || '', // 切换主题
        icon    : toValue(isDark) ? 'i-lucide-moon' : 'i-lucide-sun', // 根据当前主题显示图标
        class   : 'cursor-pointer',
        onSelect: toggleTheme, // 点击切换主题
      },
    ],
    // 外部链接
    [
      {
        label : 'GitHub', // GitHub 仓库
        icon  : 'i-simple-icons-github',
        to    : 'https://github.com/yanzhangshuai/presentation-ai', // 链接地址
        target: '_blank', // 新标签页打开
      },
    ],
    // 登出菜单
    [
      {
        label   : t('auth.logout'), // 登出
        icon    : 'i-lucide-log-out',
        class   : 'cursor-pointer',
        onSelect: () => signOut(), // 点击触发登出
      },
    ],
  ]
})
</script>

<template>
  <!-- 用户头像 + 下拉菜单 -->
  <UDropdownMenu v-if="user" :items="items" :ui="{ content: 'w-48' }">
    <UAvatar class="cursor-pointer" :src="user.image || ''" /> <!-- 用户头像触发下拉 -->
  </UDropdownMenu>
</template>

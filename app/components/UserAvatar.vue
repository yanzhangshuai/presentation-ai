<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const { signOut, data } = useAuth()
const { isDark, toggleTheme } = useTheme()
const { locale, locales, setLocale } = useI18n()

const user = computed(() => toValue(data)?.user)

const langItems = computed<DropdownMenuItem[]>(() => {
  return toValue(locales)
    .map((l) => {
      return {
        disabled: l.code === toValue(locale),
        label   : l.name,
        class   : 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800',
        onSelect: () => setLocale(l.code),
      }
    })
})

const items = computed<DropdownMenuItem[][]>(() => {
  const u = toValue(user)!
  return [
    [
      {
        label      : u.name || '',
        type       : 'label',
        description: u.email || '',
        avatar     : {
          size: 'xl',
          src : u.image || '',
        },
      },
    ],

    [
      {
        label: t('auth.profile'),
        icon : 'i-lucide-user',
        class: 'cursor-pointer',
        to   : 'https://github.com/nuxt/ui',
      },
      {
        label   : t('common.changeLanguage') || '',
        icon    : 'i-lucide-globe',
        class   : 'cursor-pointer',
        children: toValue(langItems),
      },
      {
        label   : t('common.changeTheme') || '',
        icon    : toValue(isDark) ? 'i-lucide-moon' : 'i-lucide-sun',
        class   : 'cursor-pointer',
        onSelect: toggleTheme,
      },
    ],
    [
      {
        label : 'GitHub',
        icon  : 'i-simple-icons-github',
        to    : 'https://github.com/nuxt/ui',
        target: '_blank',
      },
    ],
    [
      {
        label   : t('auth.logout'),
        icon    : 'i-lucide-log-out',
        class   : 'cursor-pointer',
        onSelect: () => signOut(),
      },
    ],
  ]
})
</script>

<template>
  <UDropdownMenu v-if="user" :items="items" :ui="{ content: 'w-48' }">
    <UAvatar class="cursor-pointer" :src="user.image || ''" />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { locale, locales, setLocale } = useI18n()

const items = computed<DropdownMenuItem[]>(() => {
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
</script>

<template>
  <UDropdownMenu :items="items" :ui="{ content: 'w-48' }">
    <UButton variant="ghost" color="neutral" class="cursor-pointer">
      <UIcon name="i-lucide-globe" class="text-2xl" />
    </UButton>
  </UDropdownMenu>
</template>

<style scoped lang="less">

</style>

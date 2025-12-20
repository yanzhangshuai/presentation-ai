<script setup lang="tsx">
import { UButton } from '#components'

import type { PresentationTheme, ThemeColors, ThemeShadows } from '~/types/presentation-theme'

import {  PresentationThemeType } from '~/types/presentation-theme'
import { listPresentationTheme } from '~/services/presentation-theme'

const emit = defineEmits<{
  change: [string]
}>()

const { isDark } = useAppTheme()

const themeStore = usePresentationThemeStore()
const { theme } = storeToRefs(themeStore)

const { data }  = await listPresentationTheme({
  type: PresentationThemeType.System,
})

const themes = data?.value?.items || []

if (!toValue(theme)) {
  // 默认值
  const def = themes.find(item => item.name === 'Mystique')!
  themeStore.setTheme(def)
  emit('change', def.id)
}

const onMoreTheme = () => {

}

const onChange = (newTheme: PresentationTheme) => {
  themeStore.setTheme(newTheme)
  emit('change', newTheme.id)
}

// 主题属性类型
const themeItem = (item: PresentationTheme) => {
  const { themeData, name, id, description } = item

  const modeColors: ThemeColors = isDark.value ? themeData.colors.dark : themeData.colors.light
  const modeShadows: ThemeShadows = isDark.value ? themeData.shadows.dark : themeData.shadows.light

  const colors = [modeColors.primary, modeColors.accent, modeColors.secondary]
  return (
    <UButton
      variant="ghost"
      class={cn(
        'group block relative space-y-2 rounded-lg border p-4 text-left transition-all',
        toValue(theme)?.id === id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50 hover:bg-muted/50',
      )}
      onClick={() => onChange(item)}

      style={{
        borderRadius: themeData.borderRadius,
        boxShadow   : modeShadows.card,
        transition  : themeData.transitions.default,
        backgroundColor:
          toValue(theme)?.id === id
            ? `${modeColors.primary}${isDark ? '15' : '08'}`
            : isDark
              ? 'rgba(0,0,0,0.3)'
              : 'rgba(255,255,255,0.9)',
      }}
    >
      <h5
        class="font-medium"
        style={{
          color     : modeColors.heading,
          fontFamily: themeData.fonts.heading,
        }}
      >
        {name}
      </h5>

      <p
        class="text-sm"
        style={{
          color     : modeColors.text,
          fontFamily: themeData.fonts.body,
        }}
      >
        {description}
      </p>

      {/* 颜色 */}
      <div class="mt-2 flex items-center gap-2">
        {
          colors.map(color => (
            <span
              class="h-4 w-4 rounded-full ring-1 ring-inset ring-white/10"
              style={{ backgroundColor: color }}
            />
          ))
        }
      </div>

      <div
        class="mt-2 text-xs"
        style={{ color: modeColors.muted }}
      >
        <span class="block">
          Heading:
          {themeData.fonts.heading}
        </span>
        <span class="block">
          Body:
          {themeData.fonts.body}
        </span>
      </div>

    </UButton>
  )
}
</script>

<template>
  <div class="space-y-4 flex-between-center">
    <h3>{{ $t('presentation.theme.title') }}</h3>
    <UButton variant="link" class="underline cursor-pointer" @click="onMoreTheme">
      {{ $t('presentation.theme.moreThemes') }}
    </UButton>
  </div>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <component :is="themeItem(item)" v-for="item in themes" :key="item.id" />
  </div>
</template>

<style scoped lang="less"></style>

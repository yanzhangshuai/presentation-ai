<script setup lang="tsx">
import { UButton } from '#components'

const emit = defineEmits<{
  (e: 'change', val: string): void
}>()

const theme = defineModel<string>({
  default: 'Forest',
})

console.log('theme value:', theme.value)

const { isDark } = useAppTheme()
const { sharedThemes } = useAvailableThemes()

const onMoreTheme = () => {

}

const onChange = (newTheme: string) => {
  emit('change', newTheme)
  theme.value = newTheme
}

// 主题属性类型
const themeItem = (item: ThemeProperties) => {
  const modeColors: ThemeColors = isDark.value ? item.colors.dark : item.colors.light
  const modeShadows: ThemeShadows = isDark.value ? item.shadows.dark : item.shadows.light

  const colors = [modeColors.primary, modeColors.accent, modeColors.secondary]
  return (
    <UButton
      variant="ghost"
      class={cn(
        'group block relative space-y-2 rounded-lg border p-4 text-left transition-all',
        theme.value === item.name ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50 hover:bg-muted/50',
      )}
      onClick={() => onChange(item.name)}

      style={{
        borderRadius: item.borderRadius,
        boxShadow   : modeShadows.card,
        transition  : item.transitions.default,
        backgroundColor:
          theme.value === item.name
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
          fontFamily: item.fonts.heading,
        }}
      >
        {item.name}
      </h5>

      <p
        class="text-sm"
        style={{
          color     : modeColors.text,
          fontFamily: item.fonts.body,
        }}
      >
        {item.description}
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
          {item.fonts.heading}
        </span>
        <span class="block">
          Body:
          {item.fonts.body}
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
    <component :is="themeItem(item)" v-for="item in sharedThemes" :key="item.name" />
  </div>
</template>

<style scoped lang="less"></style>

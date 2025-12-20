import type { PresentationTheme } from '~/types/presentation-theme'

export const usePresentationThemeStore = defineStore('presentationTheme', () => {
  const appTheme = useAppTheme()

  const theme = ref<PresentationTheme>()

  const themeData = computed(() => toValue(theme)?.themeData)

  const colors = computed(() => toValue(themeData)?.colors[appTheme.theme.value])

  if (import.meta.client) {
    watch(
      [themeData, appTheme.isDark],
      ([t, isDark]) => {
        if (t)
          setPresentationThemeVariables(t, isDark)
      },
      { immediate: true },
    )
  }

  const setTheme = (val: PresentationTheme) => {
    theme.value = val
  }

  return {
    colors,
    theme,
    themeData,
    setTheme,
  }
})

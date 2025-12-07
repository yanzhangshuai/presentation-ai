export function usePresentationTheme() {
  const appTheme = useAppTheme()
  const { availableThemes } = useAvailableThemes()
  const { presentation } = storeToRefs(usePresentationStore())

  const themeKey = computed(() => presentation.value?.theme || 'Mystique')

  const theme = computed(() =>
    availableThemes.value
      .find(t => t.name === unref(themeKey))  || availableThemes.value[0]!,
  )

  const colors = computed(() =>
    theme.value?.colors[appTheme.theme.value] || availableThemes.value[0]!.colors.light,
  )

  if (import.meta.client) {
    watch(
      [theme, appTheme.isDark],
      ([t, isDark]) => {
        if (t)
          setPresentationThemeVariables(t, isDark)
      },
      { immediate: true },
    )
  }

  return {
    theme,
    colors,
  }
}

export const usePresThemeStore = defineStore('presentationTheme', () => {
  const appTheme = useAppTheme()

  const theme = ref<ThemeProperties>(presThemes.gammaDark)

  const colors = computed(() => {
    return  theme.value.colors[appTheme.theme.value]
  })

  const setTheme = (val: ThemeProperties) => {
    theme.value = val
  }

  if (import.meta.client) {
    watch([appTheme.isDark, theme], ([val1, val2]) => {
      val2 && setPresThemeVariables(val2, val1)
    }, { immediate: true })
  }

  return {
    theme,
    colors,
    setTheme,
  }
})

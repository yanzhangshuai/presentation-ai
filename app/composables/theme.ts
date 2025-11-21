export const useTheme = createGlobalState(() => {
  const theme = useLocalStorage<'light' | 'dark'>('presentation-ai_theme', 'light')

  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme

    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme.value)
  }

  const toggleTheme = () => {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  const initTheme = () => {
    if (theme.value === 'light' || theme.value === 'dark') {
      setTheme(theme.value)
      return
    }

    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(userPrefersDark ? 'dark' : 'light')
  }

  return {
    theme,
    isDark,
    initTheme,
    setTheme,
    toggleTheme,
  }
})

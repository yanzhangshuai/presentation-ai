import { computed } from 'vue'
import { createGlobalState, useLocalStorage } from '@vueuse/core'

export const useAppTheme = createGlobalState(() => {
  const theme = useLocalStorage<'light' | 'dark'>(
    'presentation-ai_app-theme',
    'light',
    { listenToStorageChanges: true },
  )

  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
  }

  const toggleTheme = () => setTheme(isDark.value ? 'light' : 'dark')

  return { theme, isDark, setTheme, toggleTheme }
})

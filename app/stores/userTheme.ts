// stores/userTheme.ts
export const useUserThemeStore = defineStore('userTheme', () => {
  const userThemes = ref<ThemeProperties[]>([])

  function addUserTheme(theme: ThemeProperties) {
    userThemes.value.push(theme)
  }

  function removeUserTheme(name: string) {
    userThemes.value = userThemes.value.filter(t => t.name !== name)
  }

  return {
    userThemes,
    addUserTheme,
    removeUserTheme,
  }
})

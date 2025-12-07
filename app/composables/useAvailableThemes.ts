export function useAvailableThemes() {
  const userThemeStore = useUserThemeStore()

  // 1️⃣ 标准主题（静态，不 reactive）
  const sharedThemes = Object.values(presentationThemes)

  // 2️⃣ 用户主题（reactive source）
  const userThemes = computed(() => userThemeStore.userThemes)

  // 3️⃣ 所有可用主题（派生）
  const availableThemes = computed(() => [
    ...sharedThemes,
    ...userThemes.value,
  ])

  return {
    sharedThemes,
    userThemes,
    availableThemes,
  }
}

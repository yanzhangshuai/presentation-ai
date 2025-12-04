export default defineNuxtPlugin(() => {
  const { setTheme } = useAppTheme()

  if (window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', (event) => {
      setTheme(event.matches ? 'dark' : 'light')
    })
  }
})

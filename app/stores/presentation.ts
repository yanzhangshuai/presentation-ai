export const usePresentationStore = defineStore('presentation', () => {
  const presentation = ref<Presentation>()

  const setPresentation = (value: Presentation) => {
    presentation.value = value
  }

  return {
    presentation,
    setPresentation,
  }
})

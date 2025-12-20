import type { Presentation } from '~/types/presentation'

export const usePresentationStore = defineStore('presentation', () => {
  const presentation = ref<Presentation>()

  const setPresentation = (value: Presentation) => {
    // TODO: 默认值需要优化
    value.tone = value.tone || 'professional'
    presentation.value = value
  }

  return {
    presentation,
    setPresentation,
  }
})

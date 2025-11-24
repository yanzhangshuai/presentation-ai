interface CounterState {
  prompt       : string
  modelProvider: string
  modelId      : string
  numSlides    : number
  language     : keyof typeof createLanguageMap
  pageStyle    : string

}

export const usePresentation = defineStore('presentation', {
  state: (): CounterState => ({
    prompt       : '',
    modelProvider: 'deepseek',
    modelId      : 'deepseek-chat',
    numSlides    : 5,
    language     : 'en',
    pageStyle    : 'Professional',
  }),
})

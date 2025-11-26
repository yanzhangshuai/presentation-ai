interface CounterState {
  prompt       : string
  modelProvider: ModelProvider
  modelId      : string
  numSlides    : number
  language     : keyof typeof createLanguageMap
  pageStyle    : string
  outline      : boolean
  pptId        : string
  pptTitle     : string

}

export const usePresStore = defineStore('presentation', {
  state: (): CounterState => ({
    prompt       : '',
    modelProvider: 'deepseek',
    modelId      : 'deepseek-chat',
    numSlides    : 5,
    language     : 'en',
    pageStyle    : 'Professional',
    outline      : false,
    pptId        : '',
    pptTitle     : '',
  }),
})

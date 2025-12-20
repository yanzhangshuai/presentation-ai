interface PresentationCreateState {
  prompt       : string
  modelProvider: ModelProvider
  modelId      : string
  numSlides    : number
  language     : LanguageSupport
  pageStyle    : string
  web          : boolean
  themeId      : string
  title        : string
  imageSource  : string
  tone         : PresentationTone

  outline: string[]

}

export const usePresentationCreateStore = defineStore('presentationCreate', () => {
  const state = reactive<PresentationCreateState>({
    prompt       : '',
    modelProvider: 'deepseek',
    modelId      : 'deepseek-chat',
    numSlides    : 5,
    language     : 'zh',
    pageStyle    : 'default',
    web          : false,
    themeId      : '',
    title        : 'Untitled Presentation',
    outline      : [],
    imageSource  : '',
    tone         : 'professional',
  })

  const title = computed(() => state.title)

  function setTitle(val: string) {
    state.title = val
  }

  function setOutline(val: string[]) {
    state.outline = val
  }

  function reset() {
    Object.assign(state, {
      prompt       : '',
      modelProvider: 'deepseek',
      modelId      : 'deepseek-chat',
      numSlides    : 5,
      language     : 'zh',
      pageStyle    : 'default',
      web          : false,
      themeId      : '',
      title        : 'Untitled Presentation',
      outline      : [],
    })
  }

  return {
    title,
    state,
    setTitle,
    setOutline,
  }
})

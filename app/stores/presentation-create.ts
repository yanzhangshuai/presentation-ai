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
  imageSource  : ImageSource
  imageProvider: string
  imageModelId : string
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
    imageSource  : 'stock',
    imageProvider: 'unsplash',
    imageModelId : 'default',
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
      imageSource  : 'stock',
      imageProvider: 'unsplash',
      imageModelId : 'default',
      tone         : 'professional',
    })
  }

  return {
    title,
    state,
    setTitle,
    setOutline,
  }
})

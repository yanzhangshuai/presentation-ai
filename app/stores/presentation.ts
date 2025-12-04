interface OutlineState {
  prompt       : string
  modelProvider: ModelProvider
  modelId      : string
  numPage      : number
  language     : LanguageSupport
  pageStyle    : string
  web          : boolean
}

export const usePresStore = defineStore('presentation', () => {
  const createParams = reactive<OutlineState>({
    prompt       : '',
    modelProvider: 'deepseek',
    modelId      : 'deepseek-chat',
    numPage      : 5,
    language     : 'en',
    pageStyle    : 'default',
    web          : false,
  })

  const isGeneratingOutline = ref(false)

  const presentation = ref<Presentation>()

  const outline = ref<string[]>([])

  const setPres = (value: Presentation) => {
    presentation.value = value
  }

  const setOutline = (val: string[]) => {
    outline.value = val
  }

  return {
    isGeneratingOutline,
    createParams,
    presentation,
    outline,
    setPres,
    setOutline,
  }
})

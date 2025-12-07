export const usePresentationCreateStore = defineStore('presentationCreate', () => {
  const params = reactive<OutlineState>({
    prompt       : '',
    modelProvider: 'deepseek',
    modelId      : 'deepseek-chat',
    numSlides    : 5,
    language     : 'zh',
    pageStyle    : 'default',
    web          : false,
  })

  // 主题 key
  const themeKey = ref<string>('Crimson')
  function setThemeKey(val: string) {
    themeKey.value = val
  }

  const title = ref<string>('My Presentation')
  function setTitle(val: string) {
    title.value = val
  }

  // 草稿大纲
  const outline = ref<string[]>([])
  function setOutline(val: string[]) {
    outline.value = val
  }

  // 生成状态
  const isGenerating = ref(false)

  function reset() {
    Object.assign(params, {
      prompt       : '',
      modelProvider: 'deepseek',
      modelId      : 'deepseek-chat',
      numSlides    : 5,
      language     : 'zh',
      pageStyle    : 'default',
      web          : false,
    })

    themeKey.value = 'classic'
    title.value = 'My Presentation'
    outline.value = []
    isGenerating.value = false
  }

  return {
    params,
    themeKey,
    setThemeKey,
    title,
    setTitle,
    outline,
    setOutline,
    reset,
    isGenerating,
  }
})

interface OutlineState {
  prompt       : string
  modelProvider: ModelProvider
  modelId      : string
  numSlides    : number
  language     : LanguageSupport
  pageStyle    : string
  web          : boolean
}

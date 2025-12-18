const TITLE_REGEX = /<TITLE>(.*?)<\/TITLE>/i
export function useOutlineGeneration() {
  // 状态管理
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const error = ref<Error | null>(null)

  // 数据对象
  const data = reactive<{
    title   : string
    sections: string[]
  }>({
    title   : '',
    sections: [],
  })

  const { text, start, isLoading, stop } = useTextStream({
    api: '/api/presentation/outline',

    onFinish: () => {
      status.value = 'success'
    },
    onError: (err: Error) => {
      status.value = 'error'
      error.value = err
    },
  })

  // 处理 object 更新
  watch(text, (val) => {
    if (!TITLE_REGEX.test(val)) {
      return
    }

    const titleMatch = val.match(TITLE_REGEX)
    data.title = titleMatch?.[1]?.trim() ?? ''

    const items = val
      .replace(/<TITLE>.*?<\/TITLE>/i, '')
      .trim()
      .split(/^# /gm)
      .filter(Boolean)
      .map(section => `# ${section}`.trim())

    data.sections = items
  })

  // 封装 submit
  const generate = (options: {
    prompt        : string
    numSlides     : number
    modelProvider?: ModelProvider
    modelId?      : string
    language?     : LanguageSupport
    web?          : boolean
  }) => {
    status.value = 'pending'
    error.value = null
    start(options)
  }

  return {
    status,
    isLoading,
    data,
    generate,
    stop,
    error,
  }
}

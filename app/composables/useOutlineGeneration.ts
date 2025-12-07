import z from 'zod'
import { experimental_useObject as useObject } from '@ai-sdk/vue'

export function useOutlineGeneration() {
  // 状态管理
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const error = ref<Error | null>(null)

  // 数据对象
  const data = reactive({
    title  : '',
    outline: [] as string[],
  })

  // useObject 调用
  const { object, submit: _submit, isLoading, stop } = useObject({
    api   : '/api/presentation/outline',
    schema: z.object({
      title  : z.string(),
      outline: z.string(),
    }),
    onFinish: () => { status.value = 'success' },
    onError : (err: Error) => {
      status.value = 'error'
      error.value = err
    },
  })

  // 处理 object 更新
  watch(object, (val) => {
    if (!val?.outline)
      return

    data.title ||= val.title || ''

    const items = val.outline
      .replace(/<TITLE>.*?<\/TITLE>/i, '')
      .trim()
      .split(/^# /gm)
      .filter(Boolean)
      .map(section => `# ${section}`.trim())

    data.outline = items
  })

  // 封装 submit
  const submit = (options: {
    prompt        : string
    numSlides     : number
    modelProvider?: ModelProvider
    modelId?      : string
    language?     : LanguageSupport
    web?          : boolean
  }) => {
    status.value = 'pending'
    error.value = null
    _submit(options)
  }

  return {
    status,
    isLoading,
    data,
    submit,
    stop,
    error,
  }
}

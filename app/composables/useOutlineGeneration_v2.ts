import { reactive } from 'vue'

export function useOutlineGenerationV2() {
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')

  const { data, ingest, reset } = useStreamingOutlineParser()

  const { text, isLoading, error, start, stop } = useTextStream({ api: '/api/presentation/outline' })

  watch(text, (text) => {
    if (text)
      ingest(text)
  })

  function generate(options: {
    prompt        : string
    numSlides     : number
    modelProvider?: ModelProvider
    modelId?      : string
    language?     : LanguageSupport
    web?          : boolean
  }) {
    status.value = 'pending'
    reset()

    stop()
    text.value = ''

    start(options)
      .then(() => {
        status.value = 'success'
      })
      .catch(() => {
        status.value = 'error'
      })
  }

  return {
    status,
    data,
    generate,
    stop,
    isLoading,
    error,
  }
}

export type OutlineItem
  = | { type: 'heading', text: string }
    | { type: 'bullet', text: string }

export interface StreamingOutline {
  title: string
  items: OutlineItem[]
}

export function useStreamingOutlineParser() {
  const data = reactive<StreamingOutline>({
    title: '',
    items: [],
  })

  let buffer = ''
  let titleParsed = false

  /**
   * Ingest growing streaming text
   * We only process COMPLETE lines
   */
  function ingest(text: string) {
    if (!text)
      return

    // 1️⃣ Title（只解析一次）
    if (!titleParsed) {
      const m = text.match(/<title>(.*?)<\/title>/i)
      if (m) {
        data.title = m?.[1]?.trim() || ''
        titleParsed = true
      }
    }

    // 2️⃣ 移除 title，处理正文
    const body = text.replace(/<title>.*?<\/title>/i, '')

    // 3️⃣ 只处理“新增的部分”
    const delta = body.slice(buffer.length)
    buffer = body

    // 4️⃣ 按“行”解析（关键）
    const lines = delta.split(/\r?\n/)

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed)
        continue

      // Heading
      if (trimmed.startsWith('# ')) {
        data.items.push({
          type: 'heading',
          text: trimmed.slice(2).trim(),
        })
        continue
      }

      // Bullet
      if (trimmed.startsWith('- ')) {
        data.items.push({
          type: 'bullet',
          text: trimmed.slice(2).trim(),
        })
      }
    }
  }

  function reset() {
    data.title = ''
    data.items.length = 0
    buffer = ''
    titleParsed = false
  }

  return {
    data,
    ingest,
    reset,
  }
}

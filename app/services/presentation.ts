import type { Presentation, PresentationSlide } from '~/types/presentation'

/**
 *  生成幻灯片的流式接口
 * @param id
 * @param options
 * @returns
 */
export async function slidesGenerationStream(id: string, options?: {
  onUpdate?: (slide: PresentationSlide) => void
  onFinish?: () => void
  onError? : (error: Error) => void
}) {
  const abortCtrl = new AbortController()

  let slide: PresentationSlide | null = null

  try {
    const res = await fetch(`/api/presentation/${id}/generate`, {
      headers: {
        Accept: 'text/event-stream',
      },
      signal: abortCtrl.signal,
    })

    if (!res.ok || !res.body)
      throw new Error(`HTTP ${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done)
        break

      buffer += decoder.decode(value, { stream: true })

      // 按 SSE 协议，用空行分割
      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() || ''

      for (const chunk of chunks) {
        if (!chunk.startsWith('data:'))
          continue

        const json = chunk.replace(/^data:\s*/, '').trim()
        if (!json)
          continue

        try {
          const evt = JSON.parse(json)
          handleEvent(evt)
        }
        catch {
          // ignore malformed JSON
        }
      }
    }

    options?.onFinish?.()
  }
  catch (err: any) {
    if (err.name === 'AbortError')
      return

    options?.onError?.(err instanceof Error ? err : new Error(String(err)))
  }

  function handleEvent(evt: any) {
    const { event, data } = evt

    switch (event) {
      case 'presentation.start':
        break

      case 'slide.start': {
        slide = {
          id       : data.slideId,
          layout   : data.layout || 'none',
          rootImage: { query: data.rootImageQuery || '' },
          content  : [],
        }

        // slides.value.push(slide)
        break
      }

      case 'node.append': {
        // const slide = slides.value.find(
        //   s => s.id === currentSlide.value?.id,
        // )
        if (!slide)
          return

        // slide.content = slide.content.concat(data.node)
        slide.content = slide.content.concat(data.node)
        break
      }

      case 'slide.end':
      {
        if (!slide)
          return
        options?.onUpdate?.(slide)
        slide = null
        break
      }

      case 'presentation.end':
      {
        options?.onFinish?.()
        break
      }
    }
  }
}

interface EditPresentationReq {
  title?        : string
  prompt?       : string
  themeId?      : string
  language?     : string
  imageSource?  : ImageSource
  imageProvider?: string
  imageModelId? : string
  modelProvider?: string
  modelId?      : string
  pageStyle?    : string
  numSlides?    : number
  tone?         : string
  outline?      : string[]
  content?      : string
}

/**
 *  编辑presentation
 * @param id
 * @param data
 * @returns
 */
export function editPresentation(id: string, data: EditPresentationReq) {
  return $fetch(`/api/presentation/${id}`, {
    method: 'PUT',
    body  : data,
  })
}

/**
 * 获取Presentation
 * @param id
 * @returns
 */
export function getPresentation(id: string) {
  return useFetch<Presentation, string>(`/api/presentation/${id}`,    { method: 'GET' })
}

import { ref, shallowRef } from 'vue'

import type { PresentationSlide } from '~/types/presentation'

interface SlidesGenerationOptions {
  onFinish?: () => void
  onError? : (err: Error) => void
  onUpdate?: (slide: PresentationSlide) => void
}

export function useSlidesGeneration(
  options?: SlidesGenerationOptions,
) {
  // const slides = ref<PresentationSlide[]>([])
  const currentSlide = shallowRef<PresentationSlide | null>(null)

  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const totalSlides = ref<number | null>(null)

  let abortCtrl: AbortController | null = null

  async function generate(id: string) {
    stop()
    status.value = 'pending'
    abortCtrl = new AbortController()

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

      // ✅ 正常读完流，说明任务完成
      status.value = 'success'
      options?.onFinish?.()
    }
    catch (err: any) {
      if (err.name === 'AbortError')
        return

      status.value = 'error'
      options?.onError?.(err instanceof Error ? err : new Error(String(err)))
    }
  }

  function handleEvent(evt: any) {
    const { event, data } = evt

    switch (event) {
      case 'presentation.start':
        totalSlides.value = data?.totalSlides ?? null
        break

      case 'slide.start': {
        const slide: PresentationSlide = {
          id       : data.slideId,
          layout   : data.layout || 'none',
          rootImage: { query: data.rootImageQuery || '' },
          content  : [],
        }

        currentSlide.value = slide
        // slides.value.push(slide)
        break
      }

      case 'node.append': {
        // const slide = slides.value.find(
        //   s => s.id === currentSlide.value?.id,
        // )
        if (!currentSlide.value)
          return

        // slide.content = slide.content.concat(data.node)
        currentSlide.value.content
          = currentSlide.value.content.concat(data.node)
        break
      }

      case 'slide.end':
        if (currentSlide.value)
          options?.onUpdate?.(currentSlide.value)
        currentSlide.value = null
        break

      case 'presentation.end':
        // ✅ 明确的完成信号，不再依赖连接状态
        status.value = 'success'
        options?.onFinish?.()
        break
    }
  }

  function stop() {
    abortCtrl?.abort()
    abortCtrl = null

    // slides.value = []
    currentSlide.value = null
    totalSlides.value = null
    status.value = 'idle'
  }

  return {
    currentSlide,
    status,
    totalSlides,
    generate,
    stop,
  }
}

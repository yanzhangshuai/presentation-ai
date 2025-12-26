import type { PresentationSlide } from '~/types/presentation'

export function useGeneration(id: string, options?: {
  onUpdate?: (slides: Array<PresentationSlide>) => void
  onFinish?: () => void
  onError? : (error: Error) => void
}) {
  const slideParser = ref<SlideParser>()

  const slides = ref<Array<PresentationSlide>>([])
  // 状态管理
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const error = ref<Error | null>(null)

  const { text, start, isLoading, stop } = useTextStream({
    api: `/api/v2/presentation/${id}/generate`,

    onUpdate: (chunk: string) => {
      slideParse()
      options?.onUpdate?.(slides.value)
    },
    onFinish: () => {
      slideParse()
      status.value = 'success'
      options?.onFinish?.()
    },
    onError: (err: Error) => {
      status.value = 'error'
      error.value = err
      options?.onError?.(err)
    },
  })

  function slideParse() {
    toValue(slideParser)?.reset()
    const value = toValue(slideParser)?.parseChunk(text.value)
    // toValue(slideParser)?.finalize()

    // const value = toValue(slideParser)?.getAllSlides()
    if (value) {
      slides.value = value
    }
  }

  // 封装 submit
  const generate = () => {
    slideParser.value = new SlideParser()
    status.value = 'pending'
    error.value = null

    start()
  }

  return {
    status,
    slides,
    isLoading,
    generate,
    stop,
    error,
  }
}

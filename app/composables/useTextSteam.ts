import { ref } from 'vue'

export interface TextStreamOptions {
  api      : string
  headers? : Record<string, string>
  onFinish?: () => void
  onError? : (err: Error) => void
}

export function useTextStream(options: TextStreamOptions) {
  const text = ref('')
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  let controller: AbortController | null = null

  async function start(params: Record<string, any> = {}) {
    if (isLoading.value)
      return

    isLoading.value = true
    error.value = null
    text.value = ''

    controller = new AbortController()

    try {
      const res = await fetch(options.api, {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        body  : JSON.stringify(params),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      if (!res.body) {
        throw new Error('ReadableStream not supported')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')

      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break

        text.value += decoder.decode(value, { stream: true })
      }

      options.onFinish?.()
    }
    catch (err: any) {
      if (err.name !== 'AbortError') {
        error.value = err
        options.onError?.(err)
      }
    }
    finally {
      isLoading.value = false
      controller = null
    }
  }

  function stop() {
    if (controller) {
      controller.abort()
      controller = null
    }
    isLoading.value = false
  }

  return {
    text,
    isLoading,
    error,
    start,
    stop,
  }
}

import { useToast } from '#imports'
import throttle from 'lodash/throttle'

export interface SafeActionOptions<T> {
  throttle? : number
  toast?    : boolean | { duration?: number, success?: string, error?: string }
  onSuccess?: (data: T) => void
  onError?  : (err: any) => void
  onFinally?: (info: { aborted: boolean }) => void
}

type RunResult<T> = Promise<T | void>

// --- 类型区 ---
type LastArgIsSignal<F>
  = F extends (...args: infer A) => any
    ? A extends [...infer _, infer L]
      ? L extends AbortSignal ? true : false
      : false
    : false

type FnArgs<F>
  = F extends (...args: infer A) => any
    ? LastArgIsSignal<F> extends true
      ? A extends [...infer R, AbortSignal] ? R : never
      : A
    : never

type FnReturn<F>
  = F extends (...args: any[]) => Promise<infer R> ? R : never

// --- 主体逻辑 ---
export function useSafeActions() {
  const toast = useToast()

  function safeAction<F extends (...args: any[]) => Promise<any>>(
    fn: F,
    options: SafeActionOptions<FnReturn<F>> = {},
  ) {
    const _options = { toast: true, ...options }

    const loading = ref(false)
    const error = ref<string | null>(null)
    const data = ref<FnReturn<F> | null>(null)

    const controller = ref<AbortController | null>(null)
    const abort = () => controller.value?.abort()

    const _run = async (...args: FnArgs<F>): RunResult<FnReturn<F>> => {
      controller.value = new AbortController()
      const signal = controller.value.signal

      loading.value = true

      error.value = null

      try {
        // --- 运行时判断 fn 是否需要 signal ---
        const result = fn.length > args.length
          //  注入 signal（TS 类型系统允许）
          ? await fn(...args, signal)
          : await fn(...args)

        data.value = result
        _options.onSuccess?.(result)

        if (_options.toast && typeof _options.toast === 'object' && _options.toast.success) {
          toast.add({ title: _options.toast.success, duration: _options.toast.duration ?? 3000 })
        }

        return result
      }
      catch (err: any) {
        if (signal.aborted) {
          loading.value = false
          _options.onFinally?.({ aborted: true })
          return
        }

        const msg = err?.message ?? String(err)
        error.value = msg
        _options.onError?.(err)

        if (_options.toast) {
          const duration = typeof _options.toast === 'object' ? _options.toast.duration ?? 3000 : 3000

          const title
            = typeof _options.toast === 'object'
              ? _options.toast.error?.replace('{{error}}', msg) ?? msg
              : msg

          toast.add({ title, color: 'error', duration })
        }

        return
      }
      finally {
        loading.value = false
        _options.onFinally?.({ aborted: signal.aborted })
      }
    }

    const run
      = _options.throttle
        ? throttle(_run, _options.throttle, { leading: true, trailing: false })
        : _run

    return {
      run: run as (...args: FnArgs<F>) => RunResult<FnReturn<F>>,
      abort,
      loading,
      error,
      data,
    }
  }

  return { safeAction }
}

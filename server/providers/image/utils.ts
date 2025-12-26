import type { Buffer } from 'node:buffer'

import type { ImageGenerateOptions, ImageTaskResult } from './types'

export function taskSuccess(blob: Buffer): ImageTaskResult {
  return { status: 'SUCCEEDED', blob }
}

export function taskRunning(): ImageTaskResult {
  return { status: 'RUNNING' }
}

export function taskFailed(message: string): ImageTaskResult {
  return { status: 'FAILED', message }
}

export function handleError(err: Error | string): ImageTaskResult {
  const message = typeof err === 'string' ? err : err.message
  return taskFailed(`Error: ${message}`)
}

/**
 *  等待图片生成完成函数
 * @param generator
 * @param getter
 * @param options
 * @param interval
 * @param timeout
 * @returns
 */
export async function waitGenerate(
  generator: (opts: ImageGenerateOptions) => Promise<string>,
  getter: (taskId: string) => Promise<ImageTaskResult>,
  options: ImageGenerateOptions,
  interval = 3000,
  timeout = 60000,
): Promise<ImageTaskResult> {
  if (interval < 100)
    interval = 100 // 设置最小轮询间隔
  if (timeout <= 0)
    timeout = 60000 // 默认 60s

  const taskId = await generator(options)

  const start = Date.now()
  while (Date.now() - start < timeout) {
    const result = await getter(taskId)
    if (result.status !== 'RUNNING')
      return result
    await sleep(interval)
  }

  return taskFailed(`Image generation timed out (taskId=${taskId})`)
}

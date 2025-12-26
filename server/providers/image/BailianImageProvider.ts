import { requestBuffer } from '~~/server/utils/http'
import { assertConfigPresent } from '~~/server/utils/asserts'

import type { ImageGenerateOptions, ImageModelPicker, ImageProviderOptions, ImageTaskResult } from './types'

import { taskFailed, taskRunning, taskSuccess, waitGenerate } from './utils'

type AliyunModelId
  = 'wan2.6-t2i'
    | 'wan2.5-t2i-preview'
    | 'wan2.2-t2i-flash'
    | 'wan2.2-t2i-plus'
    | 'wanx2.1-t2i-turbo'
    | 'wanx2.1-t2i-plus'
    | 'wanx2.0-t2i-turbo'

const DEF_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1'

/**
 *  创建 Bailian 图片提供者
 * @param options
 * @returns
 */
export function createBailianImageProvider(options?: ImageProviderOptions): ImageModelPicker {
  // 断言
  assertConfigPresent(useRuntimeConfig(), ['aliyunBailianApiKey'])

  const { aliyunBailianApiKey } = useRuntimeConfig()

  const baseURL = options?.baseURL || DEF_BASE_URL

  const modelId = options?.modelId as AliyunModelId || 'wanx2.0-t2i-turbo'

  /**
   *  生成图片任务
   * @param options
   * @returns
   */
  const generate = async (options: ImageGenerateOptions) => {
    const url = joinURL(baseURL, '/services/aigc/text2image/image-synthesis')

    const res = await $fetch<SendTaskResult>(url, {
      method : 'POST',
      headers: {
        'Content-Type'     : 'application/json',
        'Authorization'    : `Bearer ${aliyunBailianApiKey}`,
        'X-DashScope-Async': 'enable',
      },
      body: {
        model: modelId,
        input: {
          prompt: options.prompt,
        },
        parameters: {
          size: `${options.width || 1024}*${options.height || 1024}`,
          n   : 1,
        // prompt_extend: true,
        },
      },
    })
    return res.output.task_id
  }

  /**
   *  获取任务结果
   * @param taskId
   * @returns
   */
  const getTaskResult = async (taskId: string) => {
    const url = joinURL(baseURL, `/tasks/${taskId}`)

    const data = await $fetch<TaskResult>(url, {
      method : 'GET',
      headers: {
        Authorization: `Bearer ${aliyunBailianApiKey}`,
      },
    })

    if (['PENDING', 'RUNNING'].includes(data.output.task_status)) {
      // 任务处理中
      return taskRunning()
    }

    if (data.output.task_status === 'UNKNOWN') {
      // 任务过期或未知
      return taskFailed('Task expired or unknown')
    }

    if (data.output.task_status === 'FAILED') {
      // 任务失败
      const message = data.output.message || 'Image generation failed'
      return taskFailed(message)
    }

    if (data.output.task_status === 'SUCCEEDED') {
      // 任务成功
      const imageUrl = data.output.results[0].url

      const buffer = await requestBuffer(imageUrl)
      return taskSuccess(buffer)
    }

    return taskFailed('Unknown task status')
  }

  return {
    generate,
    getTaskResult,
    waitGenerate: (options, interval, timeout) =>
      waitGenerate(generate, getTaskResult, options, interval, timeout),
  }
}

interface SendTaskResult {
  output: {
    task_id    : string
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'UNKNOWN'
  }
  request_id: string
  code?     : string
  message?  : string
}

type TaskResult
  // 处理中
  = {
    request_id: string
    output: {
      task_id    : string
      task_status: 'PENDING' | 'RUNNING'
    }
  }

  |
  // 成功
  {
    request_id: string
    output: {
      task_id       : string
      task_status   : 'SUCCEEDED'
      submit_time   : string
      scheduled_time: string
      end_time      : string
      results: {
        orig_prompt  : string
        actual_prompt: string
        url          : string
      }[]
      task_metrics: {
        TOTAL    : number
        SUCCEEDED: number
        FAILED   : number
      }
    }
    usage: {
      image_count: number
    }

  }
  // 失败
  | {
    request_id: string
    output: {
      task_id     : string
      task_status : 'FAILED'
      code        : string
      message     : string
      task_metrics: {
        TOTAL    : number
        SUCCEEDED: number
        FAILED   : number
      }
    }
  }
  // 过期
  | {
    request_id: string
    output: {
      task_id    : string
      task_status: 'UNKNOWN'
    }
  }

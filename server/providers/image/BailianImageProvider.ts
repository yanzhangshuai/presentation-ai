import  { Buffer } from 'node:buffer'

import type { ImageOptions, ImageProviderOptions } from './Index'

type AliyunModelId
  = 'wan2.6-t2i'
    | 'wan2.5-t2i-preview'
    | 'wan2.2-t2i-flash'
    | 'wan2.2-t2i-plus'
    | 'wanx2.1-t2i-turbo'
    | 'wanx2.1-t2i-plus'
    | 'wanx2.0-t2i-turbo'

const DEF_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1'
export function createBailianImageProvider(options?: ImageProviderOptions) {
  const { aliyunBailianApiKey } = useRuntimeConfig()

  if (!aliyunBailianApiKey) {
    throw new Error('Aliyun Bailian configuration is missing')
  }

  const baseURL = options?.baseURL || DEF_BASE_URL

  const modelId = options?.modelId as AliyunModelId || 'wanx2.0-t2i-turbo'

  return (imageOptions: ImageOptions) => {
    return new Promise<Buffer>((resolve, reject) => {
      // 1. 发送任务请求
      sendTaskRequest(imageOptions, baseURL, modelId)
        .then((res) => {
          const taskId =  res.output.task_id

          // 2. 轮询获取结果
          const interval = setInterval(() => {
            fetchTaskResult(taskId, baseURL)
              .then((data) => {
                if (data.output.task_status === 'SUCCEEDED') {
                //

                  clearInterval(interval)

                  const imageUrl = data.output.results[0].url

                  $fetch<ArrayBuffer>(imageUrl, {
                    method      : 'GET',
                    responseType: 'arrayBuffer',
                  })
                    .then((arrayBuffer) => {
                      const buffer = Buffer.from(arrayBuffer)
                      resolve(buffer)
                    })
                    .catch((err) => {
                      reject(err)
                    })
                }
                else if (['FAILED', 'UNKNOWN'].includes(data.output.task_status)) {
                  clearInterval(interval)
                  reject(new Error('Volc image generation failed: task failed'))
                }
                // else 继续轮询
              })
              .catch((err) => {
                clearInterval(interval)
                reject(err)
              })
          }, 3000) // 每3秒轮询一次
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

/**
 *  发送任务请求
 * @param options
 * @param baseURL
 * @param modelId
 * @returns
 */
async function sendTaskRequest(options: ImageOptions, baseURL: string, modelId: string) {
  const { aliyunBailianApiKey } = useRuntimeConfig()

  if (!aliyunBailianApiKey) {
    throw new Error('Aliyun Bailian configuration is missing')
  }

  const url = joinURL(baseURL, '/services/aigc/text2image/image-synthesis')

  const res = await $fetch<{
    output: {
      task_id    : string
      task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'UNKNOWN'
    }
    request_id: string
    code?     : string
    message?  : string
  }>(url, {
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
  return res
}

/**
 *  获取任务结果
 * @param taskId
 * @param baseURL
 * @returns
 */
function fetchTaskResult(taskId: string, baseURL: string) {
  const { aliyunBailianApiKey } = useRuntimeConfig()

  if (!aliyunBailianApiKey) {
    throw new Error('Aliyun Bailian configuration is missing')
  }

  const url = joinURL(baseURL, `/tasks/${taskId}`)

  return $fetch<TaskResult>(url, {
    method : 'GET',
    headers: {
      Authorization: `Bearer ${aliyunBailianApiKey}`,
    },
  })
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

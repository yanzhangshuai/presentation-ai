import { Buffer } from 'node:buffer'
import { volcSignature } from '~~/server/utils/volcSign'

import type { ImageOptions, ImageProviderOptions } from './Index'

const BASE_URL = 'https://visual.volcengineapi.com'

/**
 *  创建 Volc 图片提供者
 * @returns
 */
export function createVolcImageProvider(_options?: ImageProviderOptions) {
  const { volc } = useRuntimeConfig()

  if (!volc.accessKeyId || !volc.accessKeySecret) {
    throw new Error('Volc engine configuration is missing')
  }

  return (options: ImageOptions) => {
    return new Promise<Buffer>((resolve, reject) => {
      // 1. 发送任务请求
      sendTaskRequest(options)
        .then((taskId) => {
          // 2. 轮询获取结果
          const interval = setInterval(() => {
            fetchTaskResult(taskId)
              .then((data) => {
                if (data.status === 'done') {
                  clearInterval(interval)
                  // 返回图片数据
                  const base64Data = data.binary_data_base64[0]
                  const buffer = Buffer.from(base64Data, 'base64')
                  resolve(buffer)
                }
                else if (data.status === 'not_found' || data.status === 'expired') {
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
    // 发送一个http请求
  }
}

async function sendTaskRequest(options: ImageOptions) {
  const { volc } = useRuntimeConfig()

  if (!volc.accessKeyId || !volc.accessKeySecret)
    throw new Error('Volc engine configuration is missing')

  const { host } = new URL(BASE_URL)

  const query = {
    Action : 'CVSync2AsyncSubmitTask',
    Version: '2022-08-31',
    Region : 'cn-north-1',
    Service: 'cv',
  }

  const body = {
    req_key    : 'high_aes_general_v30l_zt2i',
    prompt     : options.prompt,
    use_pre_llm: true,
    width      : options.width || 1024,
    height     : options.height || 1024,
  }

  const { authorization, longDate } = volcSignature({
    accessKeyId    : volc.accessKeyId,
    secretAccessKey: volc.accessKeySecret,
    method         : 'POST',
    url            : BASE_URL,
    region         : 'cn-north-1',
    service        : 'cv',
    query,
    body,

  })

  const res = await $fetch<{
    code   : number
    message: string
    data: {
      task_id: string
    }
    request_id  : string
    time_elapsed: number
  }>(BASE_URL, {
    query,
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'X-Date'       : longDate,
      'Host'         : host,
      'Authorization': authorization,
    },
    body,
  })
  if (res.code !== 10000) {
    throw new Error(`Volc image generation failed: ${res.message} (code: ${res.code})`)
  }
  return res.data.task_id
}

/**
 *  获取任务结果
 * @param taskId
 * @returns
 */
async function fetchTaskResult(taskId: string) {
  const { volc } = useRuntimeConfig()

  if (!volc.accessKeyId || !volc.accessKeySecret)
    throw new Error('Volc engine configuration is missing')

  const query = {
    Action : 'CVSync2AsyncGetResult',
    Version: '2022-08-31',
    Region : 'cn-north-1',
    Service: 'cv',
  }

  const body = {
    req_key: 'high_aes_general_v30l_zt2i',
    task_id: taskId,
  }

  const { authorization, longDate } = volcSignature({
    accessKeyId    : volc.accessKeyId,
    secretAccessKey: volc.accessKeySecret,
    method         : 'POST',
    url            : BASE_URL,
    region         : 'cn-north-1',
    service        : 'cv',
    query,
    body,

  })

  const res = await $fetch<{
    code   : number
    message: string
    data: {
      status            : 'in_queue' | 'generating' | 'done' | 'not_found' | 'expired'
      binary_data_base64: string[]
    }
    request_id  : string
    time_elapsed: number
  }>(BASE_URL, {
    query,
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'X-Date'       : longDate,
      'Authorization': authorization,
    },
    body,
  })
  if (res.code !== 10000) {
    throw new Error(`Volc fetch task result failed: ${res.message} (code: ${res.code})`)
  }
  return res.data
}

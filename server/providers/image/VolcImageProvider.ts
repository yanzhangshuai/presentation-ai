import { Buffer } from 'node:buffer'
import { volcSignature } from '~~/server/utils/volcSign'
import { assertConfigPresent } from '~~/server/utils/asserts'

import type { ImageGenerateOptions, ImageModelPicker, ImageProviderOptions, ImageTaskResult } from './types'

import { taskFailed, taskRunning, taskSuccess, waitGenerate } from './utils'

const BASE_URL = 'https://visual.volcengineapi.com'

/**
 *  创建 Volc 图片提供者
 * @returns
 */
export function createVolcImageProvider(_options?: ImageProviderOptions): ImageModelPicker {
  assertConfigPresent(useRuntimeConfig(), ['volc.accessKeyId', 'volc.accessKeySecret'])

  const { volc } = useRuntimeConfig()

  /**
   *  生成图片任务
   * @param options
   * @returns
   */
  const generate = async (options: ImageGenerateOptions) => {
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

  const getTaskResult = async (taskId: string) => {
    const data = await fetchTaskResult(taskId)

    if (['not_found', 'expired'].includes(data.status)) {
      // 任务失败
      return taskFailed('Volc image generation failed: task failed')
    }

    if (['in_queue', 'generating'].includes(data.status)) {
      // 任务处理中
      return taskRunning()
    }

    if (data.status === 'done') {
      const base64Data = data.binary_data_base64[0]
      const buffer = Buffer.from(base64Data, 'base64')
      return taskSuccess(buffer)
    }

    return taskFailed('Volc image generation failed: unknown status')
  }

  return {
    generate,
    getTaskResult,
    waitGenerate: (options, interval, timeout) =>
      waitGenerate(generate, getTaskResult, options, interval, timeout),
  }
}

/**
 *  获取任务结果
 * @param taskId
 * @returns
 */
async function fetchTaskResult(taskId: string) {
  assertConfigPresent(useRuntimeConfig(), ['volc.accessKeyId', 'volc.accessKeySecret'])

  const { volc } = useRuntimeConfig()

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

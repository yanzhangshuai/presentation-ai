import type { Buffer } from 'node:buffer'

export type ProviderFactory = (opts?: ImageProviderOptions) => ImageModelPicker

/**
 * 图片提供者Options
 */
export interface ImageProviderOptions {
  baseURL?: string
  modelId?: string
}

/**
 * 图片生成Options
 */
export interface ImageGenerateOptions {
  // 提示词
  prompt : string
  // 图像风格
  style? : string
  // 图像模式
  mode?  : 'cheap' | 'balance' | 'pro'
  // 图片大小
  width? : number
  height?: number

}

/**
 * 图片任务结果
 */
export interface ImageTaskResult {
  status  : 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  blob?   : Buffer
  message?: string
}

export interface ImageModelPicker {
  generate     : (options: ImageGenerateOptions) => Promise<string>
  getTaskResult: (taskId: string) => Promise<ImageTaskResult>
  waitGenerate : (options: ImageGenerateOptions, interval?: number, timeout?: number) => Promise<ImageTaskResult>
}

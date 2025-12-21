import { createVolcImageProvider } from './VolcImageProvider'
import { createBailianImageProvider } from './BailianImageProvider'

export function imageModelPicker(modelProvider?: string, modelId?: string) {
  if (modelProvider === 'volc') {
    return createVolcImageProvider()
  }
  if (modelProvider === 'aliyun' && modelId) {
    return createBailianImageProvider({ modelId })
  }

  // 默认aliyun
  return createBailianImageProvider({ modelId: 'wanx2.0-t2i-turbo' })
}

export interface ImageProviderOptions {
  baseURL?: string
  modelId?: string
}

export interface ImageOptions {
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

// 定义函数类型
export type ImageGenerator = (options: ImageOptions) => Promise<string>

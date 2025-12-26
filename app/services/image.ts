import type { LayoutType } from '~/types/presentation'

/**
 * Create an image entry in the image library
 * @param url The URL of the image to be added
 * @returns
 */
export function addImageLibraryItem(url: string) {
  return $fetch('/api/image-library/add', {
    method: 'POST',
    body  : { url },
  })
}

interface GenerateAiImageReq {
  prompt      : string
  layout?     : LayoutType
  modelPicker?: string
  modelId?    : string
}

export function generateAiImage(data: GenerateAiImageReq) {
  return $fetch<{ taskId: string }>('/api/image/ai/generate', {
    method: 'POST',
    body  : data,
  })
}

export function getAiImageResult(taskId: string) {
  return $fetch<{ status: 'pending' | 'succeeded' | 'failed', url?: string, message?: string }>('/api/image/ai/result', {
    method: 'GET',
    query : { taskId },
  })
}

/**
 *
 * @param query
 * @returns
 */
export function queryStockImage(query: {
  prompt   : string
  layout?  : LayoutType
  provider?: string
}) {
  return $fetch<{ success: boolean, url?: string, error?: string }>('/api/image/stock/query', {
    method: 'GET',
    query,
  })
}

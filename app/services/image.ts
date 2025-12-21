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

export function generateAiImage(prompt: string, layout: LayoutType) {
  return $fetch<{ url: string }>('/api/image/generate', {
    method: 'POST',
    body  : {
      prompt,
      layout,
    },
  })
}

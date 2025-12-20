/**
 * Create an image entry in the image library
 * @param url The URL of the image to be added
 * @returns
 */
export function createImage(url: string) {
  return $fetch('/api/image-library/create', {
    method: 'POST',
    data  : { url },
  })
}

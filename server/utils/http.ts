import { Buffer } from 'node:buffer'

export async function requestJson<T>(url: string, options: any): Promise<T> {
  return await $fetch<T>(url, options)
}

export async function requestBuffer(url: string): Promise<Buffer> {
  const res = await $fetch<ArrayBuffer>(url, { method: 'GET', responseType: 'arrayBuffer' })
  return Buffer.from(res)
}

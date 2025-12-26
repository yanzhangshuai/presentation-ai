import type { Driver } from 'unstorage'

import NodeCache from 'node-cache'

export const nodeCacheDriverName = 'NODE_CACHE_DRIVER'

export function nodeCacheDriver(defaultTTLSeconds = 600): Driver {
  const cache = new NodeCache({ stdTTL: defaultTTLSeconds, checkperiod: Math.ceil(defaultTTLSeconds / 2) })

  return {
    // 必须实现的API
    async hasItem(key) {
      return cache.has(key)
    },
    async getItem(key) {
      return cache.get(key) ?? null
    },
    async setItem(key, value, opts) {
      const ttl = opts?.ttl ? Math.ceil(opts.ttl) : defaultTTLSeconds
      cache.set(key, value, ttl)
    },
    async removeItem(key) {
      cache.del(key)
    },
    async getKeys() {
      return cache.keys()
    },
    async clear() {
      cache.flushAll()
    },

  }
}

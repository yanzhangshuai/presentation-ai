/**
 *  暂停指定毫秒数
 * @param ms 暂停的毫秒数
 * @returns 一个在指定时间后完成的 Promise
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 让出执行权给调度器
 * @returns 一个在调度器空闲时完成的 Promise
 */
export function yieldToScheduler() {
  if (globalThis.scheduler?.yield) {
    return globalThis.scheduler.yield()
  }
  return sleep(0)
}

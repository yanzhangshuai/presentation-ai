import { sleep } from './sleep'

/**
 * 可停止轮询的控制器
 */
export interface PollController {
  /** 主动停止轮询 */
  stop     : () => void
  /** 当前轮询是否已停止 */
  isStopped: boolean
}

/**
 * 通用轮询函数
 * @param taskFn   异步任务调用函数
 * @param callback  每次轮询后回调 (result, controller)，返回 true 停止轮询
 * @param interval  轮询间隔（毫秒，默认 3000）
 * @param timeout   超时时间（毫秒，默认 60000）
 * @returns         最终一次执行 taskFn 的结果
 */
export async function poll<T>(
  taskFn: () => Promise<T>,
  callback: (result: T, controller: PollController) => boolean | void,
  interval: number = 3000,
  timeout: number = 60000,
): Promise<T> {
  // 防御性检查
  if (interval < 100)
    interval = 100
  if (timeout <= 0)
    timeout = 60000

  const controller: PollController = {
    isStopped: false,
    stop() {
      this.isStopped = true
    },
  }

  const startTime = Date.now()
  let lastResult: T

  while (true) {
    lastResult = await taskFn()

    // callback 返回 true 或外部调用 stop() 停止轮询
    if (controller.isStopped || callback(lastResult, controller) === true) {
      return lastResult
    }

    // 超时检测
    if (Date.now() - startTime >= timeout) {
      throw new Error('Polling timed out')
    }

    await sleep(interval)
  }
}

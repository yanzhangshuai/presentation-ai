/**
 * 断言配置项是否存在，支持嵌套 key 检查（使用点号分隔）
 * @param config
 * @param keys keys 支持 'a.b.c' 形式
 */
export function assertConfigPresent(config: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const parts = key.split('.')
    let current: any = config
    for (const part of parts) {
      if (current?.[part] === undefined || current?.[part] === null) {
        throw new Error(`Missing required config: ${key}`)
      }
      current = current[part]
    }
  }
}

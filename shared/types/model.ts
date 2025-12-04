import type { createLanguageMap } from '../utils/presentation'

/**
 * Model providers supported in the application
 */
export type ModelProvider = 'openai' | 'deepseek' | 'ollama' | 'lmstudio'

/**
 * 语言支持
 */
export type LanguageSupport = keyof typeof createLanguageMap

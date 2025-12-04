import type { LanguageModel } from 'ai'

import { createOpenAI } from '@ai-sdk/openai'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOllama } from 'ollama-ai-provider'

export function modelPicker(modelProvider?: string, modelId?: string): LanguageModel {
  if (modelProvider === 'ollama' && modelId) {
    const ollama = createOllama()
    return ollama(modelId) as unknown as LanguageModel
  }

  if (modelProvider === 'lmstudio' && modelId) {
    // Use LM Studio with OpenAI compatible provider
    const lmstudio = createOpenAI({
      name   : 'lmstudio',
      baseURL: 'http://localhost:1234/v1',
      apiKey : 'lmstudio',
    })
    return lmstudio(modelId)
  }

  if (modelProvider === 'openai' && modelId) {
    return createOpenAI({
      apiKey: useRuntimeConfig().openaiApiKey,
    })(modelId)
  }

  // 默认 deepseek-chat
  return  createDeepSeek({
    apiKey: useRuntimeConfig().deepseekApiKey,
  })(modelId || 'deepseek-chat')
}

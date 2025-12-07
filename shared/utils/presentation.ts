import type { LanguageSupport, ModelProvider, PresentationStyle } from '../types/presentation'

export const createLanguageMap: Record<LanguageSupport, string> = {
  'en'   : 'English (US)',
  'pt'   : 'Portuguese',
  'es'   : 'Spanish',
  'fr'   : 'French',
  'de'   : 'German',
  'it'   : 'Italian',
  'ja'   : 'Japanese',
  'ko'   : 'Korean',
  'zh'   : '简体中文',
  'zh-TW': '繁體中文',
  'ru'   : 'Russian',
  'hi'   : 'Hindi',
  'ar'   : 'Arabic',
}

// const models1 = [
//   {
//     id      : 'ollama-llama3.1:8b',
//     name    : 'llama3.1:8b',
//     provider: 'ollama',
//   },
//   {
//     id      : 'ollama-llama3.1:70b',
//     name    : 'llama3.1:70b',
//     provider: 'ollama',
//   },
//   {
//     id      : 'ollama-llama3.2:3b',
//     name    : 'llama3.2:3b',
//     provider: 'ollama',
//   },
//   {
//     id      : 'ollama-llama3.2:8b',
//     name    : 'llama3.2:8b',
//     provider: 'ollama',
//   },
//   {
//     id      : 'ollama-mistral:7b',
//     name    : 'mistral:7b',
//     provider: 'ollama',
//   },
//   {
//     id      : 'ollama-codellama:7b',
//     name    : 'codellama:7b',
//     provider: 'ollama',
//   },
//   {
//     id      : 'ollama-qwen2.5:7b',
//     name    : 'qwen2.5:7b',
//     provider: 'ollama',
//   },
//   {
//     id      : 'ollama-gemma2:9b',
//     name    : 'gemma2:9b',
//     provider: 'ollama',
//   },
//   {
//     id      : 'ollama-phi3:3.8b',
//     name    : 'phi3:3.8b',
//     provider: 'ollama',
//   },
//   {
//     id      : 'ollama-neural-chat:7b',
//     name    : 'neural-chat:7b',
//     provider: 'ollama',
//   },
// ]

export const modelSupportList: {
  modelId : string
  name    : string
  provider: ModelProvider
}[] = [
  {
    modelId : 'deepseek-chat',
    name    : 'Deepseek-Chat',
    provider: 'deepseek',
  },
  {
    modelId : 'deepseek-reasoner',
    name    : 'Deepseek-Reasoner',
    provider: 'deepseek',
  },
]

export const presentationStyles: Record<PresentationStyle, string> = {
  professional: 'Professional',
  creative    : 'Creative',
  minimalist  : 'Minimalist',
  bold        : 'Bold',
  elegant     : 'Elegant',
}

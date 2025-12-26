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

import type { ImageModelProvider, ImageModelSupport, ModelProvider } from '../types/ai'

export const TEXT_MODEL_SUPPORTS: Array<{
  provider: ModelProvider
  name    : string
  models  : {
    modelId: string
    name   : string
  }[]
}> =  [
  {
    provider: 'deepseek',
    name    : 'Deepseek',
    models  : [
      {
        modelId: 'deepseek-chat',
        name   : 'Deepseek-Chat',
      },
      {
        modelId: 'deepseek-reasoner',
        name   : 'Deepseek-Reasoner',
      },
    ],
  },
]
// export const IMAGE_MODELS: { value: ImageModelProvider, label: string }[] = [
//   { value: 'black-forest-labs/FLUX.1-schnell-Free', label: 'FLUX Fast' },
//   { value: 'black-forest-labs/FLUX.1-dev', label: 'FLUX Developer' },
//   { value: 'black-forest-labs/FLUX1.1-pro', label: 'FLUX Premium' },
// ]

export const IMAGE_MODEL_SUPPORTS: Array<{
  provider: ImageModelProvider
  name    : string
  models  : {
    modelId: string
    name   : string
  }[]
}> =  [
  {
    provider: 'bailian',
    name    : 'Bailian',
    models  : [
      {
        modelId: 'wanx2.0-t2i-turbo',
        name   : '万象2.0-T2I-Turbo',
      },
      // {
      //   modelId: 'wanx2.1-t2i-plus',
      //   name   : '万象2.1-T2I-Plus',
      // },
      // {
      //   modelId: 'wanx2.1-t2i-turbo',
      //   name   : '万象2.1-T2I-Turbo',
      // },
      // {
      //   modelId: 'wan2.2-t2i-plus',
      //   name   : '万象2.2-T2I-Plus',
      // },
      // {
      //   modelId: 'wan2.2-t2i-flash',
      //   name   : '万象2.2-T2I-Flash',
      // },
      // {
      //   modelId: 'wan2.5-t2i-preview',
      //   name   : '万象2.5-T2I-Preview',
      // },
      // {
      //   modelId: 'wan2.6-t2i',
      //   name   : '万象2.6-T2I',
      // },
    ],
  },
  {
    provider: 'volc',
    name    : 'Volc',
    models  : [
      {
        modelId: 'v1',
        name   : 'V1',
      },
    ],
  },
]

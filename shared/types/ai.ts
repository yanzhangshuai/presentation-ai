/**
 * Model providers supported in the application
 */
export type ModelProvider = 'openai' | 'deepseek' | 'ollama' | 'lmstudio'

/**
 * 图像模型支持
 *
 */
export type ImageModelSupport
  = | 'black-forest-labs/FLUX1.1-pro'
    | 'black-forest-labs/FLUX.1-schnell'
    | 'black-forest-labs/FLUX.1-schnell-Free'
    | 'black-forest-labs/FLUX.1-pro'
    | 'black-forest-labs/FLUX.1-dev'

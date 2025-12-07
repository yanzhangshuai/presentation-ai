/**
 * Model providers supported in the application
 */
export type ModelProvider = 'openai' | 'deepseek' | 'ollama' | 'lmstudio'

/**
 * 语言支持
 */
export type LanguageSupport = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh' | 'zh-TW' | 'ru' | 'hi' | 'ar'

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

/**
 * 图片库存来源
 */
export type ImageStockSource = 'unsplash' | 'pexels' | 'pixabay'
/**
 * 演示风格
 * 专业 (professional)、创意 (creative)、极简 (minimalist)、大胆 (bold)、优雅 (elegant)
 */
export type PresentationStyle = 'professional' | 'creative' | 'minimalist' | 'bold' | 'elegant'

export interface PlateSlide {
  id         : string
  content    : any[]
  rootImage? : any
  layoutType?: 'left' | 'right' | 'vertical' | 'background' | undefined
  alignment? : 'start' | 'center' | 'end'
  bgColor?   : string
  width?     : 'S' | 'M' | 'L'
}
